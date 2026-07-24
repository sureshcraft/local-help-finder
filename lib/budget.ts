import type { Match, Service } from "./types";

type LatLng = { lat: number; lng: number };
type Scored = Service & { score: number };

/** Great-circle distance in km between two lat/lng points. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** No budget = everything is affordable; otherwise cost must be within budget. */
export function affordable(s: { cost: number }, budget?: number): boolean {
  return budget == null || s.cost <= budget;
}

/** Drop unaffordable services, attach distance, sort nearest-first then by score. */
export function rankMatches(scored: Scored[], origin: LatLng, budget?: number): Match[] {
  return scored
    .filter((s) => affordable(s, budget))
    .map((s) => ({ ...s, distanceKm: haversineKm(origin, s) }))
    .sort((a, b) => a.distanceKm - b.distanceKm || b.score - a.score);
}
