import type { AgentEnvelope } from "./schema";

// Deterministic-engine-first (Stadium-Command-Center). Answer WITHOUT the LLM whenever a
// rule/lookup can — it's faster, reliable, cheap, and a strong pitch line. Return null to
// fall through to Gemini. On the day, add exact lookups/routing/emergency rules here.
export function tryDeterministic(input: string): AgentEnvelope | null {
  const t = input.trim().toLowerCase();

  if (t === "ping") {
    return { answer: "pong (answered by the deterministic engine, no LLM call)", cards: [], actions: [], rejected_alternatives: [], language: "en" };
  }
  // e.g. exact-match FAQ, routing, emergency codes → return an envelope here.

  return null; // fall through to the LLM
}
