import { Firestore, FieldValue } from "@google-cloud/firestore";
import type { Service } from "./types";

export type Hit = { id: string; data: Service; distance: number };
export interface VectorStore {
  search(queryVector: number[], k: number): Promise<Hit[]>;
}

type Entry = { id: string; data: Service; embedding: number[] };

function cosineDistance(a: number[], b: number[]): number {
  let dot = 0,
    ma = 0,
    mb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    ma += a[i] ** 2;
    mb += b[i] ** 2;
  }
  return 1 - dot / (Math.sqrt(ma) * Math.sqrt(mb) || 1);
}

/** No-infra store: used in tests and as the Vercel fallback. */
export class InMemoryVectorStore implements VectorStore {
  constructor(private entries: Entry[]) {}
  async search(q: number[], k: number): Promise<Hit[]> {
    return this.entries
      .map((e) => ({ id: e.id, data: e.data, distance: cosineDistance(q, e.embedding) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  }
}

/** Firestore native vector search via findNearest (COSINE). */
export class FirestoreVectorStore implements VectorStore {
  private db = new Firestore();
  constructor(private collection = "services") {}
  async search(q: number[], k: number): Promise<Hit[]> {
    const snap = await this.db
      .collection(this.collection)
      .findNearest({
        vectorField: "embedding",
        queryVector: q,
        limit: k,
        distanceMeasure: "COSINE",
      })
      .get();
    return snap.docs.map((d) => ({ id: d.id, data: d.data() as Service, distance: 0 }));
  }
}

export { FieldValue };
