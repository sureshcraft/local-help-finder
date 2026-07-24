import { describe, it, expect } from "vitest";
import { normalize } from "../lib/embeddings";

describe("normalize", () => {
  it("returns a unit vector (magnitude ~1)", () => {
    const n = normalize([3, 4]); // magnitude 5 → [0.6, 0.8]
    expect(n[0]).toBeCloseTo(0.6);
    expect(n[1]).toBeCloseTo(0.8);
    const mag = Math.sqrt(n.reduce((s, x) => s + x * x, 0));
    expect(mag).toBeCloseTo(1);
  });

  it("handles a zero vector without NaN", () => {
    expect(normalize([0, 0])).toEqual([0, 0]);
  });
});
