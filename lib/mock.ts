import type { AgentEnvelope } from "./schema";

// Demo-safety mock path (pitchpal's "mock" lane). Flip DEMO_MOCK=1 in .env.local to run the whole
// app on seeded data, so a live pitch survives a dead wifi / rate-limit. Swap this seed for content
// that matches your build before you go on stage.
export function mockEnvelope(userText: string): AgentEnvelope {
  return {
    answer: "Sample result (demo mode - no live model call, so this can't fail on stage).",
    cards: [
      { title: "Sample insight", detail: "Seeded demo data so the flow always runs, even offline." },
      { title: "Your input", detail: userText.slice(0, 120) },
    ],
    actions: ["Show more", "Explain this"],
    rejected_alternatives: [],
    language: "en",
  };
}

export function mockPlan() {
  return {
    plan: {
      meals: [
        { slot: "Breakfast", name: "Poha", note: "quick and cheap" },
        { slot: "Lunch", name: "Dal rice", note: "" },
        { slot: "Dinner", name: "Roti sabzi", note: "" },
      ],
      grocery: [
        { item: "Rice", qty: "1kg", estCost: 60 },
        { item: "Dal", qty: "500g", estCost: 70 },
        { item: "Vegetables", qty: "1kg", estCost: 80 },
      ],
      substitutions: [{ from: "paneer", to: "tofu", reason: "cheaper protein" }],
    },
    budget: { total: 210, limit: 400, withinBudget: true, over: 0 },
  };
}
