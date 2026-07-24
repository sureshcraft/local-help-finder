import services from "../data/services.json";
import { haversineKm } from "./budget";
import type { Match, Needs, Service } from "./types";

const ORIGIN = { lat: 13.0418, lng: 80.2341 }; // T.Nagar

export type FindResult = { needs: Needs; matches: Match[]; considered: number; fallback?: boolean };

/**
 * Offline seatbelt: NO network. If the real pipeline throws (Firestore / Vertex / ADC down), we still
 * return relevant-ish cards via a naive keyword match over the seeded corpus — the demo never dies.
 */
export function seededFallback(text: string): FindResult {
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const list = services as Service[];
  const scored: Match[] = list.map((s) => {
    const hay = `${s.name} ${s.category} ${s.notes}`.toLowerCase();
    const score = words.filter((w) => hay.includes(w)).length;
    return { ...s, score, distanceKm: haversineKm(ORIGIN, s), why: "Shown from offline fallback." };
  });
  const hits = scored.filter((m) => m.score > 0).sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
  const matches = (hits.length ? hits : [...scored].sort((a, b) => a.distanceKm - b.distanceKm)).slice(0, 5);
  return { needs: { categories: [], constraints: [] }, matches, considered: 0, fallback: true };
}
