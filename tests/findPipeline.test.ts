import { describe, it, expect, vi } from "vitest";

vi.mock("../lib/vertexClient", () => ({
  extractNeeds: vi.fn(async () => ({ categories: ["physiotherapy"], budget: 1000, constraints: [] })),
  reason: vi.fn(async (_n: any, m: any[]) => m.map((x) => ({ ...x, why: "fits" }))),
}));
vi.mock("../lib/embeddings", () => ({ embedText: vi.fn(async () => [1, 0]) }));

import { runFind } from "../lib/findPipeline";
import { InMemoryVectorStore } from "../lib/vectorStore";

describe("runFind", () => {
  it("returns ranked matches with a why and a distance", async () => {
    const store = new InMemoryVectorStore([
      { id: "p", data: { id: "p", cost: 500, lat: 13.05, lng: 80.24 } as any, embedding: [1, 0] },
    ]);
    const out = await runFind("help dad walk", store, { lat: 13.04, lng: 80.23 });
    expect(out[0].why).toBe("fits");
    expect(out[0]).toHaveProperty("distanceKm");
  });
});
