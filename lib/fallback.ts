import type { AgentEnvelope } from "./schema";

// Graceful fallback (concourse-ai fallback.js, pitchops). When the LLM errors or the key
// is missing, return a keyword-matched local answer instead of going silent. Judges reward
// resilience — "never a blank screen on demo day".
const RULES: { keys: string[]; answer: string }[] = [
  { keys: ["help", "what can you do"], answer: "I turn your request into a clear answer with action cards and next steps." },
  // ADD challenge-specific safety answers here on the day.
];

export function fallbackEnvelope(userText: string): AgentEnvelope {
  const q = userText.toLowerCase();
  const hit = RULES.find((r) => r.keys.some((k) => q.includes(k)));
  return {
    answer: hit?.answer ?? "I'm having trouble reaching the model right now — please try again in a moment.",
    cards: [],
    actions: ["Try again"],
    rejected_alternatives: [],
    language: "en",
  };
}
