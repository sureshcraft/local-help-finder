import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight per-IP rate limiter for API routes (Security axis). In-memory sliding window —
// fine for a demo/single instance; use a shared store (Redis/Firestore) for multi-instance.
// NOTE: Next 16 is renaming middleware → "proxy"; this still works (builds as "Proxy (Middleware)")
// but you may see a deprecation warning. If a fresh Next 16 scaffold complains, rename the file to
// proxy.ts and export `proxy` instead of `middleware` — same logic.
const WINDOW_MS = 10_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, number[]>();

export function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (recent.length > MAX_REQUESTS) {
    return NextResponse.json({ error: "Rate limit exceeded. Please slow down." }, { status: 429 });
  }
  return NextResponse.next();
}

// Only guard the API — never rate-limit page loads or static assets.
export const config = { matcher: "/api/:path*" };
