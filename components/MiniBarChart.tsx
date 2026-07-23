// Dependency-free, accessible bar chart (inline SVG-free flexbox) for "ops / analytics / dashboard"
// challenges — winners like StadiumPulse used charts. No external lib (keeps the bundle + CSP clean).
// Accessible: the whole chart carries a text summary via role="img" + aria-label.

type Bar = { label: string; value: number };

export function MiniBarChart({ data, title, unit = "" }: { data: Bar[]; title?: string; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const summary = data.map((d) => `${d.label}: ${d.value}${unit}`).join(", ");

  return (
    <figure
      role="img"
      aria-label={`${title ? title + ". " : ""}${summary}`}
      className="rounded-xl border border-neutral-200 bg-white p-4"
    >
      {title && <figcaption className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</figcaption>}
      <div className="flex h-32 items-end gap-2" aria-hidden="true">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-neutral-500">{d.value}{unit}</span>
            <div
              className="w-full rounded-t bg-emerald-500"
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
            />
            <span className="truncate text-[10px] text-neutral-500" title={d.label}>{d.label}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
