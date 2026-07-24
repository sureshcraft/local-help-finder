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

/**
 * Drop unaffordable services, then rank by a BLENDED score: relevance leads, distance is a gentle
 * penalty (so a marginally-relevant service 200m away can't beat the best match a little further).
 */
export function rankMatches(
  scored: Scored[],
  origin: LatLng,
  budget?: number,
  distancePenaltyPerKm = 0.03,
): Match[] {
  return scored
    .filter((s) => affordable(s, budget))
    .map((s) => {
      const distanceKm = haversineKm(origin, s);
      return { match: { ...s, distanceKm } as Match, rank: s.score - distanceKm * distancePenaltyPerKm };
    })
    .sort((a, b) => b.rank - a.rank)
    .map((x) => x.match);
}
