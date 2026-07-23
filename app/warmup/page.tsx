"use client";

import { useState } from "react";

type Plan = {
  meals: { slot: string; name: string; note: string }[];
  grocery: { item: string; qty: string; estCost: number }[];
  substitutions: { from: string; to: string; reason: string }[];
};
type Budget = { total: number; limit: number; withinBudget: boolean; over: number };

// PRE-STAGED WARM-UP SKELETON. Known 2026 warm-up = "cooking to-do list". If the real warm-up
// differs, this same shape (input → strict-JSON → 3-4 sections → deterministic compute) still fits —
// just repoint the prompt in app/api/warmup/route.ts.
export default function Warmup() {
  const [day, setDay] = useState("Busy work-from-home day, gym in the evening. Veg. Quick meals.");
  const [budget, setBudget] = useState(500);
  const [diet, setDiet] = useState("vegetarian");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [b, setB] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true); setError(""); setPlan(null); setB(null);
    try {
      const res = await fetch("/api/warmup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, budget, diet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPlan(data.plan); setB(data.budget);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">PromptWars · Warm-up</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900">Cooking to-do list</h1>
      <p className="mt-2 text-neutral-500">Your day in → plan, grocery list, substitutions, and a budget check that is computed <b>deterministically</b> (never by the LLM).</p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <textarea value={day} onChange={(e) => setDay(e.target.value)} rows={2}
          className="rounded-xl border border-neutral-200 p-3 outline-none focus:border-emerald-500" />
        <div className="flex flex-wrap gap-3">
          <label className="text-sm text-neutral-600">Budget ₹
            <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))}
              className="ml-2 w-24 rounded-lg border border-neutral-200 p-2" />
          </label>
          <label className="text-sm text-neutral-600">Diet
            <select value={diet} onChange={(e) => setDiet(e.target.value)} className="ml-2 rounded-lg border border-neutral-200 p-2">
              <option>vegetarian</option><option>vegan</option><option>none</option><option>high-protein</option>
            </select>
          </label>
          <button onClick={run} disabled={loading}
            className="ml-auto rounded-full bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
            {loading ? "Planning…" : "Plan my day"}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {b && (
        <div className={`mt-6 rounded-xl p-4 ${b.withinBudget ? "bg-emerald-50" : "bg-red-50"}`}>
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className={b.withinBudget ? "text-emerald-700" : "text-red-700"}>
              {b.withinBudget ? "✓ Within budget" : `✗ Over by ₹${b.over}`}
            </span>
            <span className="text-neutral-600">₹{b.total} / ₹{b.limit}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
            <div className={`h-2 rounded-full ${b.withinBudget ? "bg-emerald-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(100, (b.total / b.limit) * 100)}%` }} />
          </div>
        </div>
      )}

      {plan && (
        <div className="mt-6 space-y-6">
          <section>
            <h2 className="mb-2 font-bold text-neutral-900">Meal plan</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {plan.meals.map((m, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{m.slot}</p>
                  <p className="mt-1 font-semibold text-neutral-900">{m.name}</p>
                  {m.note && <p className="mt-1 text-sm text-neutral-500">{m.note}</p>}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-bold text-neutral-900">Grocery list</h2>
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              <table className="w-full text-sm">
                <tbody>
                  {plan.grocery.map((g, i) => (
                    <tr key={i} className="border-b border-neutral-100 last:border-0">
                      <td className="p-3 text-neutral-800">{g.item}</td>
                      <td className="p-3 text-neutral-500">{g.qty}</td>
                      <td className="p-3 text-right font-medium text-neutral-700">₹{g.estCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {plan.substitutions.length > 0 && (
            <section>
              <h2 className="mb-2 font-bold text-neutral-900">Substitutions</h2>
              <ul className="space-y-2">
                {plan.substitutions.map((s, i) => (
                  <li key={i} className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
                    <b>{s.from}</b> → <b>{s.to}</b> — {s.reason}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
