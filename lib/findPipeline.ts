import { extractNeeds, reason } from "./vertexClient";
import { embedText } from "./embeddings";
import { rankMatches } from "./budget";
import { originFor } from "./areas";
import type { VectorStore } from "./vectorStore";
import type { Needs, Service } from "./types";
import type { FindResult } from "./findFallback";

/** Coerce LLM-extracted fields strictly to data (Security): finite positive budget, real strings only. */
export function normalizeNeeds(n: Needs): Needs {
  const budget =
    typeof n?.budget === "number" && Number.isFinite(n.budget) && n.budget > 0 ? n.budget : undefined;
  return {
    categories: Array.isArray(n?.categories) ? n.categories.filter((c) => typeof c === "string") : [],
    area: typeof n?.area === "string" ? n.area : undefined,
    budget,
    constraints: Array.isArray(n?.constraints) ? n.constraints.filter((c) => typeof c === "string") : [],
  };
}

/** Full pipeline: (extract ∥ embed) → vector search → deterministic blended rank → reason. */
export async function runFind(
  text: string,
  store: VectorStore,
  defaultOrigin: { lat: number; lng: number },
): Promise<FindResult> {
  // extract and embed both need only the input text — run them in PARALLEL to cut latency.
  const [rawNeeds, q] = await Promise.all([extractNeeds(text), embedText(text, "RETRIEVAL_QUERY")]);
  const needs = normalizeNeeds(rawNeeds);

  const hits = await store.search(q, 8);
  const cats = new Set(needs.categories.map((c) => c.toLowerCase()));
  const scored = hits.map((h, i) => {
    const s = h.data as Service;
    const base = 1 - i / Math.max(hits.length, 1); // vector relevance rank
    const boost = cats.has(s.category.toLowerCase()) ? 0.3 : 0; // extracted category earns its keep
    return { ...s, score: base + boost };
  });

  const origin = originFor(needs.area, defaultOrigin); // rank from the area the user actually said
  const ranked = rankMatches(scored, origin, needs.budget);
  const matches = await reason(needs, ranked.slice(0, 5));
  return { needs, matches, considered: hits.length };
}
