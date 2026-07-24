import { MapsEmbed } from "./MapsEmbed";
import { calendarEventUrl } from "@/lib/googleActions";
import type { Match } from "@/lib/types";

// showMap: render the embedded map only on the hero (top) result — five iframes is heavy and slow.
export function ServiceCard({ m, showMap = false }: { m: Match; showMap?: boolean }) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-semibold text-neutral-900">{m.name}</h3>
        <span className="whitespace-nowrap text-sm text-neutral-500">{m.distanceKm.toFixed(1)} km</span>
      </div>
      <p className="mt-0.5 text-sm text-neutral-500">
        {m.category} · {m.area} · {m.cost === 0 ? "Free" : `₹${m.cost}`}
      </p>
      {m.why && <p className="mt-2 text-sm text-neutral-700">{m.why}</p>}
      {showMap && (
        <div className="mt-3 overflow-hidden rounded-lg">
          <MapsEmbed query={`${m.name}, ${m.area}, Chennai`} title={m.name} height={180} />
        </div>
      )}
      <a
        className="mt-3 inline-block text-sm font-medium text-emerald-700 underline"
        href={calendarEventUrl({ title: `Visit ${m.name}`, location: `${m.name}, ${m.area}, Chennai` })}
        target="_blank"
        rel="noreferrer"
      >
        Add appointment to Calendar
      </a>
    </article>
  );
}
