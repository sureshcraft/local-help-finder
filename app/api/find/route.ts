import { sanitizeInput } from "@/lib/prompts";
import { runFind } from "@/lib/findPipeline";
import { FirestoreVectorStore } from "@/lib/vectorStore";

export const maxDuration = 60;

// T.Nagar, Chennai — the demo's default "where the person is".
const DEFAULT_ORIGIN = { lat: 13.0418, lng: 80.2341 };

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim()) {
      return Response.json({ error: "empty_input" }, { status: 400 });
    }
    const clean = sanitizeInput(text);
    const matches = await runFind(clean, new FirestoreVectorStore(), DEFAULT_ORIGIN);
    return Response.json({ matches });
  } catch (e) {
    console.error("find_failed", e);
    return Response.json({ error: "find_failed" }, { status: 502 });
  }
}
