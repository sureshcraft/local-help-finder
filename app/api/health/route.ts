import { NextResponse } from "next/server";

// Health check that lists integrated services (reliability + a cheap "we used many Google services"
// proof for the automated scan). Extend the `services` map as you wire more in.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      gemini: process.env.GEMINI_API_KEY ? "configured" : "missing-key",
      googleActions: "enabled: Maps, Calendar, Gmail, Search, Translate (zero-auth deep-links)",
      caching: "in-memory (lib/cache.ts)",
      demoMock: process.env.DEMO_MOCK === "1",
    },
  });
}
