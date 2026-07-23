import { z } from "zod";

// The ONE envelope every agent call returns. Rendered as cards/chips, never raw chat.
// `rejected_alternatives` (stadium-ops-reasoning-console) forces the model to show what it
// ruled out — a transparency/pitch trick judges like.
export const AgentEnvelope = z.object({
  answer: z.string(),
  cards: z.array(z.object({ title: z.string(), detail: z.string() })).default([]),
  actions: z.array(z.string()).default([]), // suggested follow-up chips
  rejected_alternatives: z.array(z.string()).default([]),
  language: z.string().default("en"),
});
export type AgentEnvelope = z.infer<typeof AgentEnvelope>;

/** Strip ```json fences, parse, validate. Never throws — returns a safe envelope. */
export function parseEnvelope(raw: string): AgentEnvelope {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  try {
    const parsed = AgentEnvelope.safeParse(JSON.parse(cleaned));
    if (parsed.success) return parsed.data;
  } catch {
    /* fall through */
  }
  return { answer: cleaned || raw, cards: [], actions: [], rejected_alternatives: [], language: "en" };
}
