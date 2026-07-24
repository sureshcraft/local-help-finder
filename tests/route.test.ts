import { describe, it, expect, vi } from "vitest";

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

describe("POST /api/find", () => {
  it("returns the pipeline result for valid input", async () => {
    const req = new Request("http://x/api/find", { method: "POST", body: JSON.stringify({ text: "help dad walk" }) });
    const res = await POST(req as any);
    const json = await res.json();
    expect(json.matches[0].id).toBe("p");
    expect(json.considered).toBe(8);
  });

  it("rejects empty input with 400", async () => {
    const req = new Request("http://x/api/find", { method: "POST", body: JSON.stringify({ text: "  " }) });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("falls back to seeded results (no 502) when the pipeline throws", async () => {
    (runFind as any).mockRejectedValueOnce(new Error("firestore down"));
    const req = new Request("http://x/api/find", { method: "POST", body: JSON.stringify({ text: "physiotherapy for elderly father" }) });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.fallback).toBe(true);
    expect(json.matches.length).toBeGreaterThan(0);
  });
});
