import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/findPipeline", () => ({
  runFind: vi.fn(async () => ({
    needs: { categories: ["physiotherapy"], constraints: [] },
    matches: [
      { id: "p", name: "Physio", category: "physiotherapy", area: "T.Nagar", cost: 500, lat: 0, lng: 0, why: "fits", distanceKm: 1, score: 1 },
    ],
    considered: 8,
  })),
}));
vi.mock("@/lib/vectorStore", () => ({
  FirestoreVectorStore: class {
    async search() {
      return [];
    }
  },
}));

import { POST } from "@/app/api/find/route";
import { runFind } from "@/lib/findPipeline";
import { clearCache } from "@/lib/cache";

function post(text: string) {
  return POST(new Request("http://x/api/find", { method: "POST", body: JSON.stringify({ text }) }) as any);
}

describe("POST /api/find", () => {
  beforeEach(() => clearCache());

  it("returns the pipeline result + diagnostic headers on a fresh call", async () => {
    const res = await post("help dad walk in T.Nagar");
    const json = await res.json();
    expect(json.matches[0].id).toBe("p");
    expect(json.considered).toBe(8);
    expect(res.headers.get("X-Cache")).toBe("MISS");
    expect(res.headers.get("X-Request-ID")).toBeTruthy();
  });

  it("rejects empty input with 400", async () => {
    const res = await post("  ");
    expect(res.status).toBe(400);
  });

  it("rejects an oversized payload with 413", async () => {
    const res = await post("x".repeat(11000));
    expect(res.status).toBe(413);
  });

  it("falls back to seeded results (no 502) when the pipeline throws", async () => {
    (runFind as any).mockRejectedValueOnce(new Error("firestore down"));
    const res = await post("physiotherapy for elderly father");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.fallback).toBe(true);
    expect(json.matches.length).toBeGreaterThan(0);
    expect(res.headers.get("X-Cache")).toBe("FALLBACK");
  });
});
