import { GoogleGenAI } from "@google/genai";
import { buildSystemPrompt } from "./prompts";
import { parseEnvelope, type AgentEnvelope } from "./schema";
import { fallbackEnvelope } from "./fallback";
import { TOOL_DECLARATIONS, runTool } from "./tools";

// gemini-3.6-flash = fast, GA (default). gemini-3-pro = deeper.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// Multi-model failover cascade (matchday-command): retry across models on retryable errors.
// Quota insurance on Gemini's free tier (~250 req/day). Override via GEMINI_MODEL_CHAIN.
const MODEL_CHAIN = (process.env.GEMINI_MODEL_CHAIN || `${MODEL},gemini-3.5-flash-lite`)
  .split(",").map((s) => s.trim()).filter(Boolean);

let _ai: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _ai;
}

function isRetryable(e: unknown): boolean {
  const m = (e instanceof Error ? e.message : String(e)) || "";
  return /(429|500|503|overload|unavailable|rate.?limit|exhausted|deadline)/i.test(m);
}

export type AgentImage = { mimeType: string; data: string }; // data = base64 (no prefix)

/** Raw call with failover — returns the full SDK response (needed for tool calls). */
async function generateRaw(contents: unknown, config?: Record<string, unknown>) {
  let lastErr: unknown;
  for (const model of MODEL_CHAIN) {
    try {
      return await client().models.generateContent({ model, contents, config } as never);
    } catch (e) {
      lastErr = e;
      if (!isRetryable(e)) throw e; // non-retryable (bad key, bad request) → fail fast
    }
  }
  throw lastErr;
}

/** Core generate with failover. Returns text. Throws only if every model fails. */
export async function generate(contents: unknown, config?: Record<string, unknown>): Promise<string> {
  const res = await generateRaw(contents, config);
  return res.text ?? "";
}

function userParts(text: string, image?: AgentImage) {
  const parts: Array<Record<string, unknown>> = [{ text }];
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  return [{ role: "user", parts }];
}

/** One agent step (text in, text out, optional vision). Chain these for depth. */
export async function runAgentStep(prompt: string, image?: AgentImage): Promise<string> {
  return generate(userParts(prompt, image));
}

/** Ask for JSON and parse it (handles ```json fences). */
export async function runAgentJSON<T = unknown>(prompt: string, image?: AgentImage): Promise<T> {
  const raw = await generate(userParts(prompt + "\n\nReturn ONLY valid JSON, no fences.", image), {
    responseMimeType: "application/json",
  });
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned) as T;
}

/**
 * The winning-pattern call: dynamic system prompt (role-lock + keyword-RAG + live state) →
 * strict-JSON envelope → Zod-validated → graceful fallback on any error. Never throws.
 */
export async function runAgentEnvelope(
  userText: string,
  opts?: { liveState?: string; image?: AgentImage; targetLanguage?: string }
): Promise<AgentEnvelope> {
  try {
    const text = await generate(userParts(userText, opts?.image), {
      systemInstruction: buildSystemPrompt({ userText, liveState: opts?.liveState, targetLanguage: opts?.targetLanguage }),
      responseMimeType: "application/json",
    });
    return parseEnvelope(text);
  } catch {
    return fallbackEnvelope(userText);
  }
}

/**
 * Tool-calling loop: the model can CALL functions (lib/tools.ts) instead of guessing; code returns
 * the truth. Returns the final text + a trace of tool calls (render the trace = visible elegance).
 */
export async function runAgentWithTools(
  userText: string,
  opts?: { liveState?: string }
): Promise<{ text: string; trace: Array<{ tool: string; args: unknown; result: unknown }> }> {
  const contents: Array<Record<string, unknown>> = [{ role: "user", parts: [{ text: userText }] }];
  const config = {
    systemInstruction: buildSystemPrompt({ userText, liveState: opts?.liveState }),
    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
  };
  const trace: Array<{ tool: string; args: unknown; result: unknown }> = [];

  for (let hop = 0; hop < 4; hop++) {
    const res = await generateRaw(contents, config);
    const calls = res.functionCalls ?? [];
    if (!calls.length) return { text: res.text ?? "", trace };

    // Push the model's ACTUAL content — Gemini 3 requires the thoughtSignature on the functionCall
    // part to be echoed back; reconstructing the part loses it.
    const modelContent = res.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent as unknown as Record<string, unknown>);
    else contents.push({ role: "model", parts: calls.map((c) => ({ functionCall: c })) });

    const parts = calls.map((c) => {
      const nm = c.name ?? "";
      const result = runTool(nm, (c.args ?? {}) as Record<string, unknown>);
      trace.push({ tool: nm, args: c.args, result });
      return { functionResponse: { name: nm, response: { result } } };
    });
    contents.push({ role: "user", parts });
  }
  const res = await generateRaw(contents, config);
  return { text: res.text ?? "", trace };
}

/**
 * Google Search grounding: the model answers using LIVE web results and returns the sources.
 * Use for fact-heavy challenges (real links, current info) — the "search-grounded resources" winning
 * pattern. Render `sources` as citations. Never throws (returns empty on error).
 */
export async function runGrounded(
  prompt: string,
  opts?: { liveState?: string }
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> {
  try {
    const res = await generateRaw(userParts(prompt), {
      systemInstruction: buildSystemPrompt({ userText: prompt, liveState: opts?.liveState }),
      tools: [{ googleSearch: {} }],
    });
    const chunks = (res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []) as Array<{ web?: { uri?: string; title?: string } }>;
    const sources = chunks
      .filter((c) => c.web?.uri)
      .map((c) => ({ title: c.web?.title ?? c.web!.uri!, uri: c.web!.uri! }));
    return { text: res.text ?? "", sources };
  } catch {
    return { text: "", sources: [] };
  }
}
