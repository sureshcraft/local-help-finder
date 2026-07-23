import { NextRequest, NextResponse } from "next/server";
import { generate } from "@/lib/gemini";
import { parseMealPlan, checkBudget } from "@/lib/warmup";
import { mockPlan } from "@/lib/mock";

// Warm-up round endpoint: unstructured day → strict-JSON plan → DETERMINISTIC budget check →
// validator-in-the-loop re-plan if over budget. Shows off the winning refinements in the 1h round.
export async function POST(req: NextRequest) {
  try {
    const { day, budget: limit = 500, diet = "none" } = (await req.json()) as {
      day?: string; budget?: number; diet?: string;
    };
    if (!day) return NextResponse.json({ error: "Describe your day." }, { status: 400 });

    // Demo-safety: seeded plan if DEMO_MOCK=1 (bulletproof stage demo).
    if (process.env.DEMO_MOCK === "1") return NextResponse.json(mockPlan());
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Add GEMINI_API_KEY to .env.local." }, { status: 500 });
    }

    const ask = (extra = "") => `You plan one day of meals.
Day: "${day}"
Dietary need: ${diet}
Budget: INR ${limit}
Return ONLY JSON (no fences): {"meals":[{"slot":"Breakfast|Lunch|Dinner","name":string,"note":string}],"grocery":[{"item":string,"qty":string,"estCost":number}],"substitutions":[{"from":string,"to":string,"reason":string}]}
estCost is a realistic per-item INR price. ${extra}`;

    // 1) first plan
    let plan = parseMealPlan(await generate([{ role: "user", parts: [{ text: ask() }] }], { responseMimeType: "application/json" }));
    let budget = checkBudget(plan, limit);

    // 2) validator-in-the-loop: deterministic over-budget check drives a targeted re-plan (max 2)
    for (let i = 0; i < 2 && !budget.withinBudget; i++) {
      const extra = `The previous plan's groceries cost INR ${budget.total}, which is INR ${budget.over} OVER budget. Cheapen or drop items to fit INR ${limit}.`;
      plan = parseMealPlan(await generate([{ role: "user", parts: [{ text: ask(extra) }] }], { responseMimeType: "application/json" }));
      budget = checkBudget(plan, limit);
    }

    return NextResponse.json({ plan, budget });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "warm-up failed" }, { status: 500 });
  }
}
