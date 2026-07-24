import { describe, it, expect, vi } from "vitest";

vi.mock("../lib/vertexClient", () => ({
  extractNeeds: vi.fn(async () => ({ categories: ["physiotherapy"], budget: 1000, constraints: [] })),
  reason: vi.fn(async (_n: any, m: any[]) => m.map((x) => ({ ...x, why: "fits" }))),
}));
vi.mock("../lib/embeddings", () => ({ embedText: vi.fn(async () => [1, 0]) }));

import { runFind, normalizeNeeds } from "../lib/findPipeline";
import { InMemoryVectorStore } from "../lib/vectorStore";

describe("runFind", () => {
  it("returns needs, ranked matches (with why + distance), and a considered count", async () => {
    const store = new InMemoryVectorStore([
      { id: "p", data: { id: "p", category: "physiotherapy", cost: 500, lat: 13.05, lng: 80.24 } as any, embedding: [1, 0] },
    ]);
    const out = await runFind("help dad walk", store, { lat: 13.04, lng: 80.23 });
    expect(out.matches[0].why).toBe("fits");
    expect(out.matches[0]).toHaveProperty("distanceKm");
    expect(out.considered).toBe(1);
  });
});

describe("normalizeNeeds (clamps LLM output)", () => {
  it("drops a non-finite/negative budget and coerces arrays", () => {
    const n = normalizeNeeds({ categories: ["x", 5 as any], area: 9 as any, budget: NaN, constraints: null as any });
    expect(n.budget).toBeUndefined();
    expect(n.categories).toEqual(["x"]);
    expect(n.area).toBeUndefined();
    expect(n.constraints).toEqual([]);
  });
  it("keeps a valid finite budget", () => {
    expect(normalizeNeeds({ categories: [], constraints: [], budget: 800 }).budget).toBe(800);
  });
});
