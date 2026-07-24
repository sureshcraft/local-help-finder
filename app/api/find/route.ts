import { sanitizeInput } from "@/lib/prompts";
import { runFind } from "@/lib/findPipeline";
import { FirestoreVectorStore } from "@/lib/vectorStore";
import { seededFallback } from "@/lib/findFallback";

export const maxDuration = 60;

// T.Nagar, Chennai — the demo's default "where the person is" (overridden if they name an area).
const DEFAULT_ORIGIN = { lat: 13.0418, lng: 80.2341 };

export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return Response.json({ error: "empty_input" }, { status: 400 });
    }
    const clean = sanitizeInput(text);
    const result = await runFind(clean, new FirestoreVectorStore(), DEFAULT_ORIGIN);
    return Response.json(result);
  } catch (e) {
    // Seatbelt: never a flat 502 on stage — return offline seeded results instead.
    console.error("find_failed, using seeded fallback:", e);
    return Response.json(seededFallback(text));
  }
}
