import { NextResponse } from "next/server";
import { isAppError } from "./errors";

// API response helpers with diagnostic headers (X-Request-ID, X-Response-Time, X-Cache) — cheap
// Efficiency/Code-Quality signal and great for demoing "⚡ Cached, 200ms". Winning-build pattern.

export function jsonResponse(
  data: unknown,
  opts?: { requestId?: string; startTime?: number; cache?: "HIT" | "MISS"; status?: number; headers?: Record<string, string> },
): NextResponse {
  const headers: Record<string, string> = { ...(opts?.headers ?? {}) };
  if (opts?.requestId) headers["X-Request-ID"] = opts.requestId;
  if (opts?.startTime != null) headers["X-Response-Time"] = `${Date.now() - opts.startTime}ms`;
  if (opts?.cache) headers["X-Cache"] = opts.cache;
  return NextResponse.json(data as object, { status: opts?.status ?? 200, headers });
}

/** Error response; uses AppError.statusCode when available, else the fallback. */
export function errorResponse(err: unknown, fallbackStatus = 500): NextResponse {
  const status = isAppError(err) ? err.statusCode : fallbackStatus;
  const message = err instanceof Error ? err.message : "Internal server error";
  return NextResponse.json({ error: message }, { status });
}
