"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { ReasoningStrip } from "@/components/ReasoningStrip";
import type { Match, Needs } from "@/lib/types";

type FindResult = { needs: Needs; matches: Match[]; considered: number; fallback?: boolean };

const SAMPLE =
  "my elderly father in Adyar needs physiotherapy after knee surgery and maybe a wheelchair on rent, budget is tight around 800 rupees a session";

function chipsFor(needs: Needs): string[] {
  const chips = [...(needs.categories ?? [])];
  if (needs.area) chips.push(`area: ${needs.area}`);
  if (needs.budget != null) chips.push(`budget ₹${needs.budget}`);
  (needs.constraints ?? []).forEach((c) => chips.push(c));
  return chips;
}

export default function FindDemo() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<FindResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("request failed");
      setResult(await res.json());
    } catch {
      setError("Could not fetch help right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const summary = result
    ? result.fallback
      ? "Offline fallback — showing best guesses."
      : `Understood the need, searched ${result.considered} services, showing ${result.matches.length}.`
    : undefined;

  return (
    <div className="w-full max-w-2xl">
      <label htmlFor="need" className="block text-sm font-medium text-neutral-700">
        Describe the need
      </label>
      <textarea
        id="need"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-neutral-900"
        placeholder="e.g. elderly father in Adyar needs physiotherapy after surgery, tight budget..."
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setText(SAMPLE)}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Load sample
        </button>
        <button
          type="button"
          onClick={run}
          disabled={loading || !text.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Finding…" : "Find help"}
        </button>
      </div>
      <div role="status" aria-live="polite" className="mt-6 space-y-3">
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {result && <ReasoningStrip chips={chipsFor(result.needs)} summary={summary} />}
        {result && result.matches.length === 0 && (
          <p className="text-sm text-neutral-500">No matching services found.</p>
        )}
        {result?.matches.map((m, i) => (
          <ServiceCard key={m.id} m={m} showMap={i === 0} />
        ))}
      </div>
    </div>
  );
}
