import { describe, it, expect } from "vitest";
import { checkBudget, parseMealPlan, type MealPlan } from "../lib/warmup";

const plan = (estCosts: number[]): MealPlan => ({
  meals: [],
  grocery: estCosts.map((estCost, i) => ({ item: `item${i}`, qty: "1", estCost })),
  substitutions: [],
});

// The flagship rule: WE sum the grocery, never the LLM. These prove the arithmetic is ours.
describe("checkBudget", () => {
  it("sums grocery cost and reports within-budget", () => {
    const b = checkBudget(plan([100, 150, 50]), 500);
    expect(b.total).toBe(300);
    expect(b.withinBudget).toBe(true);
    expect(b.over).toBe(0);
  });

  it("reports the overage when the total exceeds the limit", () => {
    const b = checkBudget(plan([400, 300]), 500);
    expect(b.total).toBe(700);
    expect(b.withinBudget).toBe(false);
    expect(b.over).toBe(200);
  });

  it("treats non-numeric costs as zero (never NaN)", () => {
    const bad = { meals: [], grocery: [{ item: "x", qty: "1", estCost: NaN }], substitutions: [] };
    const b = checkBudget(bad as unknown as MealPlan, 100);
    expect(b.total).toBe(0);
    expect(b.withinBudget).toBe(true);
  });
});

describe("parseMealPlan", () => {
  it("parses a fenced plan", () => {
    const p = parseMealPlan('```json\n{"meals":[{"slot":"Lunch","name":"Dal rice"}]}\n```');
    expect(p.meals[0].name).toBe("Dal rice");
  });

  it("falls back to an empty plan on garbage", () => {
    const p = parseMealPlan("not json");
    expect(p.meals).toEqual([]);
    expect(p.grocery).toEqual([]);
  });
});
