import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/findPipeline", () => ({
  runFind: vi.fn(async () => [
    { id: "p", name: "Physio", category: "physiotherapy", area: "T.Nagar", cost: 500, lat: 0, lng: 0, why: "fits", distanceKm: 1, score: 1 },
  ]),
}));
vi.mock("@/lib/vectorStore", () => ({
  FirestoreVectorStore: class {
    async search() {
      return [];
    }
  },
}));

import { POST } from "@/app/api/find/route";

describe("POST /api/find", () => {
  it("returns matches for valid input", async () => {
    const req = new Request("http://x/api/find", { method: "POST", body: JSON.stringify({ text: "help dad walk" }) });
    const res = await POST(req as any);
    const json = await res.json();
    expect(json.matches[0].id).toBe("p");
  });

  it("rejects empty input with 400", async () => {
    const req = new Request("http://x/api/find", { method: "POST", body: JSON.stringify({ text: "  " }) });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
