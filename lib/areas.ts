// Map an extracted area name → representative Chennai coordinates, so the ranking origin
// follows what the user actually said (not a hardcoded default). Deterministic + testable.
const RAW: Record<string, [number, number]> = {
  "t nagar": [13.0418, 80.2341],
  adyar: [13.0012, 80.2565],
  velachery: [12.9791, 80.221],
  "anna nagar": [13.085, 80.2101],
  mylapore: [13.0339, 80.2619],
  nungambakkam: [13.0604, 80.2426],
  guindy: [13.0067, 80.2206],
  porur: [13.0382, 80.1565],
  chromepet: [12.9516, 80.1462],
  tambaram: [12.9249, 80.1],
};

function norm(s: string): string {
  return s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

/** Resolve a spoken area to coords; fall back to the given default if unknown. */
export function originFor(area: string | undefined, fallback: { lat: number; lng: number }) {
  if (!area) return fallback;
  const n = norm(area);
  for (const [k, [lat, lng]] of Object.entries(RAW)) {
    if (n.includes(k) || k.includes(n)) return { lat, lng };
  }
  return fallback;
}
