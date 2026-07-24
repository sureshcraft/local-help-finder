import { GoogleGenAI } from "@google/genai";

const DIM = 768;
const MODEL = "gemini-embedding-001";

// Lazy client so importing `normalize` in tests needs no credentials.
let _ai: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!_ai) {
    _ai = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
    });
  }
  return _ai;
}

/** L2-normalize to a unit vector (required for any dim other than 3072). */
export function normalize(v: number[]): number[] {
  const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return mag === 0 ? v : v.map((x) => x / mag);
}

async function embedRaw(texts: string[], taskType: string): Promise<number[][]> {
  const res = await client().models.embedContent({
    model: MODEL,
    contents: texts,
    config: { taskType, outputDimensionality: DIM },
  });
  return (res.embeddings ?? []).map((e) => normalize(e.values ?? []));
}

export async function embedText(text: string, taskType = "RETRIEVAL_QUERY"): Promise<number[]> {
  return (await embedRaw([text], taskType))[0];
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return embedRaw(texts, "RETRIEVAL_DOCUMENT");
}
