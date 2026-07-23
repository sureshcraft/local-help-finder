import { z } from "zod";

// Warm-up round pattern: unstructured input → strict-JSON, 3-4 sections. The known 2026
// warm-up brief is a "cooking to-do list" (meal plan + grocery + substitutions + budget check),
// but it ROTATES — this file is the reusable *shape*, easy to repoint at any warm-up theme.
export const MealPlan = z.object({
  meals: z.array(z.object({
    slot: z.string(),          // Breakfast / Lunch / Dinner
    name: z.string(),
    note: z.string().default(""),
  })).default([]),
  grocery: z.array(z.object({
    item: z.string(),
    qty: z.string().default(""),
    estCost: z.number().default(0), // INR — the MODEL estimates item costs...
  })).default([]),
  substitutions: z.array(z.object({ from: z.string(), to: z.string(), reason: z.string() })).default([]),
});
export type MealPlan = z.infer<typeof MealPlan>;

/** DETERMINISTIC budget check — WE sum the items, never trust the LLM's arithmetic. */
export function checkBudget(plan: MealPlan, limit: number) {
  const total = plan.grocery.reduce((s, g) => s + (Number(g.estCost) || 0), 0);
  return { total: Math.round(total), limit, withinBudget: total <= limit, over: Math.max(0, Math.round(total - limit)) };
}

export function parseMealPlan(raw: string): MealPlan {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  try {
    const p = MealPlan.safeParse(JSON.parse(cleaned));
    if (p.success) return p.data;
  } catch {
    /* fall through */
  }
  return { meals: [], grocery: [], substitutions: [] };
}
