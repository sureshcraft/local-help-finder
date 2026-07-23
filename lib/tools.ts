import { Type } from "@google/genai";

// Tool-calling (the biggest elegance lift, from pitchpal). The model CALLS a function instead of
// guessing, and code returns the truth. Add domain tools here on the day. Example below:
// lookupTypicalCost — when the user didn't give an amount, the model looks it up instead of inventing.

export const TOOL_DECLARATIONS = [
  {
    name: "lookupTypicalCost",
    description:
      "Return a typical INR cost for a common grocery or everyday expense item. Call this instead of guessing a number when the user did not state an amount.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        item: { type: Type.STRING, description: "item name, e.g. 'petrol', 'milk', 'tea', 'rice'" },
      },
      required: ["item"],
    },
  },
];

// Deterministic implementations — this is the "truth" code, never the model.
const COST_TABLE: Record<string, number> = {
  petrol: 110, diesel: 95, milk: 33, tea: 15, coffee: 25, oats: 35, rice: 60, dal: 70,
  bread: 45, eggs: 7, vegetables: 80, chicken: 220, recharge: 239, bus: 25, auto: 40,
};

export function runTool(name: string, args: Record<string, unknown>): unknown {
  if (name === "lookupTypicalCost") {
    const item = String(args?.item ?? "").toLowerCase().trim();
    const cost = COST_TABLE[item] ?? null;
    return { item, typicalCostInr: cost, source: cost != null ? "local-table" : "unknown" };
  }
  return { error: `unknown tool: ${name}` };
}
