import { describe, it, expect } from "vitest";
import { originFor } from "../lib/areas";

const DEF = { lat: 13.0418, lng: 80.2341 };

describe("originFor", () => {
  it("resolves a known area", () => {
    expect(originFor("Adyar", DEF).lat).toBeCloseTo(13.0012);
  });
  it("handles dots/case ('T.Nagar')", () => {
    expect(originFor("T.Nagar", DEF).lat).toBeCloseTo(13.0418);
  });
  it("falls back for unknown or empty area", () => {
    expect(originFor(undefined, DEF)).toEqual(DEF);
    expect(originFor("Atlantis", DEF)).toEqual(DEF);
  });
});
