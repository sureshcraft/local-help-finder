"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import type { Match } from "@/lib/types";

const SAMPLE =
  "my elderly father in T.Nagar needs physiotherapy after knee surgery and maybe a wheelchair on rent, budget is tight around 800 rupees a session";

export default function FindDemo() {
  const [text, setText] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setMatches(null);
    try {
      const res = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("request failed");
      const json = await res.json();
      setMatches(json.matches ?? []);
    } catch {
      setError("Could not fetch help right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
        placeholder="e.g. elderly father needs physiotherapy after surgery, tight budget..."
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
        {matches && matches.length === 0 && (
          <p className="text-sm text-neutral-500">No matching services found.</p>
        )}
        {matches?.map((m) => (
          <ServiceCard key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}
