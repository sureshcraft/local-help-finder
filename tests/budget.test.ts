import { describe, it, expect } from "vitest";
import { haversineKm, affordable, rankMatches } from "../lib/budget";

describe("budget", () => {
  it("haversine: T.Nagar → Adyar is a few km", () => {
    const d = haversineKm({ lat: 13.0418, lng: 80.2341 }, { lat: 13.0012, lng: 80.2565 });
    expect(d).toBeGreaterThan(4);
    expect(d).toBeLessThan(10);
  });

  it("affordable: no budget = always true", () => {
    expect(affordable({ cost: 5000 }, undefined)).toBe(true);
  });

  it("affordable: within vs over budget", () => {
    expect(affordable({ cost: 800 }, 1000)).toBe(true);
    expect(affordable({ cost: 1200 }, 1000)).toBe(false);
  });

  it("rankMatches: drops unaffordable, sorts nearest-first", () => {
    const origin = { lat: 13.04, lng: 80.23 };
    const scored = [
      { id: "a", cost: 500, lat: 13.2, lng: 80.3, score: 0.9 } as any,
      { id: "b", cost: 500, lat: 13.05, lng: 80.24, score: 0.5 } as any,
      { id: "c", cost: 5000, lat: 13.05, lng: 80.24, score: 0.99 } as any,
    ];
    const out = rankMatches(scored, origin, 1000);
    expect(out.map((m) => m.id)).toEqual(["b", "a"]); // c filtered; b nearer than a
    expect(out[0].distanceKm).toBeLessThan(out[1].distanceKm);
  });
});
