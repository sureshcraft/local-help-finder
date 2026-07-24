import { sanitizeInput } from "@/lib/sanitize";
import { runFind } from "@/lib/findPipeline";
import { FirestoreVectorStore } from "@/lib/vectorStore";
import { seededFallback } from "@/lib/findFallback";
import { hashInput, cached } from "@/lib/cache";

export const maxDuration = 60;

const DEFAULT_ORIGIN = { lat: 13.0418, lng: 80.2341 }; // T.Nagar (overridden if the user names an area)
const MAX_BODY = 10_000; // 10 KB — cap raw payload (sanitizeInput caps the string, not the JSON)
const TTL = 5 * 60_000;

export async function POST(req: Request) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  const withHeaders = (cache: string) => ({
    "X-Request-ID": requestId,
    "X-Response-Time": `${Date.now() - start}ms`,
    "X-Cache": cache, // note: in-memory cache is per-instance — demo the HIT locally
  });

  let text = "";
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) {
      return Response.json({ error: "payload_too_large" }, { status: 413 });
    }
    const body = JSON.parse(raw);
    text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return Response.json({ error: "empty_input" }, { status: 400 });
    }
    const clean = sanitizeInput(text);
    const { value: result, hit } = await cached(hashInput(clean), TTL, () =>
      runFind(clean, new FirestoreVectorStore(), DEFAULT_ORIGIN),
    );
    // Seatbelt-on-empty: a real-but-empty result still shows the audience something in a demo.
    const final = result.matches.length === 0 && !result.fallback ? seededFallback(clean) : result;
    return Response.json(final, { headers: withHeaders(hit ? "HIT" : "MISS") });
  } catch (e) {
    // Seatbelt: never a flat 502 on stage — return offline seeded results instead.
    console.error("find_failed, using seeded fallback:", e);
    return Response.json(seededFallback(text), { headers: withHeaders("FALLBACK") });
  }
}
