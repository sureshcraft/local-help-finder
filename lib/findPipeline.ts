import { extractNeeds, reason } from "./vertexClient";
import { embedText } from "./embeddings";
import { rankMatches } from "./budget";
import type { VectorStore } from "./vectorStore";
import type { Match, Service } from "./types";

/** Full pipeline: extract → embed → vector search → deterministic rank → reason. */
export async function runFind(
  text: string,
  store: VectorStore,
  origin: { lat: number; lng: number },
): Promise<Match[]> {
  const needs = await extractNeeds(text);
  const q = await embedText(text, "RETRIEVAL_QUERY");
  const hits = await store.search(q, 8);
  const scored = hits.map((h, i) => ({
    ...(h.data as Service),
    score: 1 - i / Math.max(hits.length, 1),
  }));
  const ranked = rankMatches(scored, origin, needs.budget);
  return reason(needs, ranked.slice(0, 5));
}
