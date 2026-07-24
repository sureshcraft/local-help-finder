import { describe, it, expect } from "vitest";
import { InMemoryVectorStore } from "../lib/vectorStore";

describe("InMemoryVectorStore", () => {
  it("returns the k nearest by cosine, nearest first", async () => {
    const store = new InMemoryVectorStore([
      { id: "x", data: { id: "x" } as any, embedding: [1, 0] },
      { id: "y", data: { id: "y" } as any, embedding: [0, 1] },
      { id: "z", data: { id: "z" } as any, embedding: [0.9, 0.1] },
    ]);
    const hits = await store.search([1, 0], 2);
    expect(hits.map((h) => h.id)).toEqual(["x", "z"]);
  });
});
