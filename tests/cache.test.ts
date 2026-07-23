import { describe, it, expect, beforeEach } from "vitest";
import { hashInput, cached, clearCache } from "../lib/cache";

beforeEach(() => clearCache());

describe("hashInput", () => {
  it("is deterministic and key-order independent", () => {
    expect(hashInput({ a: 1, b: 2 })).toBe(hashInput({ b: 2, a: 1 }));
  });
  it("differs for different inputs", () => {
    expect(hashInput("chennai")).not.toBe(hashInput("mumbai"));
  });
});

describe("cached", () => {
  it("misses first, hits second, and runs fn only once", async () => {
    let calls = 0;
    const run = () => { calls++; return Promise.resolve("v"); };
    const a = await cached("k", 10_000, run);
    const b = await cached("k", 10_000, run);
    expect(a.hit).toBe(false);
    expect(b.hit).toBe(true);
    expect(b.value).toBe("v");
    expect(calls).toBe(1);
  });
});
