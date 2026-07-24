import { describe, it, expect } from "vitest";
import { seededFallback } from "../lib/findFallback";

describe("seededFallback (offline seatbelt)", () => {
  it("returns relevant matches offline for a keyword query", () => {
    const r = seededFallback("need physiotherapy for my elderly father");
    expect(r.fallback).toBe(true);
    expect(r.matches.length).toBeGreaterThan(0);
    expect(r.matches[0]).toHaveProperty("distanceKm");
  });
  it("never returns empty, even for an unrelated query", () => {
    expect(seededFallback("xyzzy").matches.length).toBeGreaterThan(0);
  });
});
