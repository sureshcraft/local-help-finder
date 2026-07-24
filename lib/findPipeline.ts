import { extractNeeds, reason } from "./vertexClient";
import { embedText } from "./embeddings";
import { rankMatches } from "./budget";
import { originFor } from "./areas";
import type { VectorStore } from "./vectorStore";
import type { Service } from "./types";
import type { FindResult } from "./findFallback";

/** Full pipeline: (extract ∥ embed) → vector search → deterministic rank → reason. */
export async function runFind(
  text: string,
  store: VectorStore,
  defaultOrigin: { lat: number; lng: number },
): Promise<FindResult> {
  // extract and embed both need only the input text — run them in PARALLEL to cut latency.
  const [needs, q] = await Promise.all([extractNeeds(text), embedText(text, "RETRIEVAL_QUERY")]);
  const hits = await store.search(q, 8);
  const scored = hits.map((h, i) => ({
    ...(h.data as Service),
    score: 1 - i / Math.max(hits.length, 1),
  }));
  const origin = originFor(needs.area, defaultOrigin); // rank from the area the user actually said
  const ranked = rankMatches(scored, origin, needs.budget);
  const matches = await reason(needs, ranked.slice(0, 5));
  return { needs, matches, considered: hits.length };
}
