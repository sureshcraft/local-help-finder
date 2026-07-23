import { createHash } from "crypto";

// Response caching — a proven winning lift (Efficiency axis + a demo that returns instantly).
// Hash the normalized inputs, cache the result with a TTL, show a "⚡ Cached" badge in the UI.
// In-memory suits a demo/single instance; swap `store` for Firestore/Redis for cross-instance.
// ⚠️ On Vercel, serverless invocations hit different/cold instances, so this Map does NOT persist —
// demo the "⚡ Cached" speed LOCALLY, and for a persistent prod cache replace `store` with Firestore
// (keep the same `cached()`/`hashInput()` signatures so nothing else changes).

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  const o = v as Record<string, unknown>;
  return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + stableStringify(o[k])).join(",") + "}";
}

/** Stable SHA-256 of any JSON-serialisable input (equal inputs → equal hash, key order ignored). */
export function hashInput(input: unknown): string {
  return createHash("sha256").update(stableStringify(input)).digest("hex");
}

type Entry = { value: unknown; expires: number };
const store = new Map<string, Entry>();

/** Get-or-compute with a TTL. Returns { value, hit } so the UI can flag a cache hit. */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
  const now = Date.now();
  const e = store.get(key);
  if (e && e.expires > now) return { value: e.value as T, hit: true };
  const value = await fn();
  store.set(key, { value, expires: now + ttlMs });
  return { value, hit: false };
}

/** Reset the cache (tests / manual clear). */
export function clearCache(): void {
  store.clear();
}
