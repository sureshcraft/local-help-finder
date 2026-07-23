"use client";

import { useEffect, useRef, useState } from "react";
import { calendarEventUrl, gmailDraftUrl } from "@/lib/googleActions";

type Card = { title: string; detail: string };
type Envelope = { answer: string; cards: Card[]; actions: string[]; rejected_alternatives: string[]; language: string };

// Winning-pattern UI: strict-JSON envelope rendered as CARDS + follow-up CHIPS (never raw chat),
// a source badge (transparency), a "ruled-out" panel (rejected_alternatives — the pitch trick),
// a PROACTIVE beat, and an accessible results region (aria-live).
export default function AgentDemo() {
  const [prompt, setPrompt] = useState("Give me 3 crisp next steps for: ");
  const [env, setEnv] = useState<Envelope | null>(null);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [proactive, setProactive] = useState("");
  const beatRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (beatRef.current) clearTimeout(beatRef.current); }, []);

  async function run(text = prompt) {
    setLoading(true); setError(""); setEnv(null); setProactive("");
    if (beatRef.current) clearTimeout(beatRef.current);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setEnv(data.envelope); setSource(data.source);
      // The proactive beat: the app acts unprompted a few seconds later (illustrative).
      beatRef.current = setTimeout(() => setProactive("I noticed you might want a follow-up — want me to draft the next step?"), 9000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const badge =
    source === "llm" ? { t: "LIVE · Gemini", c: "bg-emerald-100 text-emerald-700" }
    : source === "deterministic" ? { t: "DETERMINISTIC · no LLM", c: "bg-blue-100 text-blue-700" }
    : source === "no-key" ? { t: "DEMO · add key", c: "bg-amber-100 text-amber-700" }
    : { t: "", c: "" };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <label htmlFor="agent-input" className="mb-2 block text-sm font-medium text-neutral-500">Your input</label>
      <textarea
        id="agent-input"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      <button
        onClick={() => run()}
        disabled={loading}
        aria-busy={loading}
        className="mt-4 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Thinking…" : "Run the agent"}
      </button>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Results region — aria-live so screen readers announce the async result (Accessibility axis). */}
      <section aria-live="polite" aria-atomic="true" role="status">
      {env && (
        <div className="mt-5 space-y-4 animate-in">
          <div className="flex items-center gap-2">
            {badge.t && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.c}`}>{badge.t}</span>}
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">lang: {env.language}</span>
          </div>

          <p className="whitespace-pre-wrap text-neutral-800">{env.answer}</p>

          {env.cards.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {env.cards.map((c, i) => (
                <article key={i} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="font-semibold text-neutral-900">{c.title}</p>
                  <p className="mt-1 text-sm text-neutral-600">{c.detail}</p>
                </article>
              ))}
            </div>
          )}

          {env.actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {env.actions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(a); run(a); }}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* Transparency: what the agent deliberately RULED OUT (architectural-elegance pitch trick). */}
          {env.rejected_alternatives?.length > 0 && (
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-800">Ruled out (and why)</p>
              <ul className="space-y-1">
                {env.rejected_alternatives.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-950"><span className="text-amber-600">✕</span><span>{r}</span></li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
            <span className="w-full text-xs font-medium text-neutral-400">AI → real Google action (no OAuth):</span>
            <a
              href={calendarEventUrl({ title: "Follow-up from my agent", details: env.answer })}
              target="_blank" rel="noreferrer"
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >📅 Add to Calendar</a>
            <a
              href={gmailDraftUrl({ subject: "From my agent", body: env.answer })}
              target="_blank" rel="noreferrer"
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >✉️ Draft email</a>
          </div>
        </div>
      )}
      </section>

      {proactive && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3">
          <span className="text-lg" aria-hidden="true">⚡</span>
          <div>
            <p className="text-sm text-emerald-900">{proactive}</p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Proactive · illustrative</span>
          </div>
        </div>
      )}
    </div>
  );
}
