import type { NextRequest } from "next/server";
import { runAgentEnvelope, type AgentImage } from "@/lib/gemini";
import { tryDeterministic } from "@/lib/deterministic";
import { mockEnvelope } from "@/lib/mock";
import { sanitizeInput } from "@/lib/prompts";
import { cached, hashInput } from "@/lib/cache";
import { jsonResponse, errorResponse } from "@/lib/http";
import { ValidationError } from "@/lib/errors";
import { logInfo, logError } from "@/lib/logger";

// Vercel: allow up to 60s so a slow Gemini call doesn't 504 (Hobby functions default to a short
// timeout). On Cloud Run, deploy with --timeout 300 instead.
export const maxDuration = 60;

// Winning-pattern endpoint: validate → deterministic-first → cached strict-JSON envelope, with
// diagnostic headers (X-Request-ID / X-Response-Time / X-Cache) and typed error handling.
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const body = (await req.json()) as { prompt?: string; image?: AgentImage; liveState?: string };
    const prompt = sanitizeInput(body.prompt ?? "");
    if (!prompt) throw new ValidationError("prompt is required");

    // 0) Demo-safety: seeded data if DEMO_MOCK=1 (survives dead wifi / rate-limit on stage).
    if (process.env.DEMO_MOCK === "1")
      return jsonResponse({ envelope: mockEnvelope(prompt), source: "mock" }, { requestId, startTime });

    // 1) Answer without the LLM whenever a rule can (fast, reliable, cheap).
    const deterministic = tryDeterministic(prompt);
    if (deterministic)
      return jsonResponse({ envelope: deterministic, source: "deterministic" }, { requestId, startTime });

    // 2) No key yet? Don't crash the demo — say so in-band.
    if (!process.env.GEMINI_API_KEY)
      return jsonResponse(
        {
          envelope: { answer: "Add GEMINI_API_KEY to .env.local to enable the model.", cards: [], actions: [], rejected_alternatives: [], language: "en" },
          source: "no-key",
        },
        { requestId, startTime },
      );

    // 3) Cached model call — identical prompts return instantly ("⚡ Cached"), 10-min TTL.
    const key = hashInput({ prompt, liveState: body.liveState });
    const { value: envelope, hit } = await cached(key, 10 * 60_000, () =>
      runAgentEnvelope(prompt, { image: body.image, liveState: body.liveState }),
    );
    logInfo("agent.responded", { requestId, cache: hit ? "HIT" : "MISS" });
    return jsonResponse({ envelope, source: "llm" }, { requestId, startTime, cache: hit ? "HIT" : "MISS" });
  } catch (err) {
    logError("agent.failed", { requestId, error: err instanceof Error ? err.message : String(err) });
    return errorResponse(err);
  }
}
