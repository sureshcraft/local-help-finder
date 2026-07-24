// Surface the agent's REASONING so the intelligence is VISIBLE — the pitch money-moment.
// Show the structured signal the agent extracted (chips) + a one-line "what it did", ABOVE the
// results. Invisible intelligence reads as a search box; visible intelligence reads as an agent.
export function ReasoningStrip({ chips = [], summary }: { chips?: string[]; summary?: string }) {
  if (chips.length === 0 && !summary) return null;
  return (
    <div
      className="w-full rounded-lg border border-emerald-200 bg-emerald-50/60 p-3"
      aria-label="What the assistant understood"
    >
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <span
              key={i}
              className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200"
            >
              {c}
            </span>
          ))}
        </div>
      )}
      {summary && <p className="mt-2 text-sm text-emerald-900/80">{summary}</p>}
    </div>
  );
}
