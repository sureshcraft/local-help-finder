import type { NextConfig } from "next";

// Security headers (Security axis). CSP is Google-aware — it allows Gemini/Maps/Firebase/Fonts so
// Google-service features (e.g. an embedded Map) keep working, while still locking everything else
// down. Pattern from the PromptWars Bengaluru #1 winning build.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com",
  "style-src 'self' 'unsafe-inline' *.googleapis.com",
  "img-src 'self' data: blob: https: *.googleapis.com *.gstatic.com *.google.com",
  "frame-src maps.google.com *.google.com",
  "connect-src 'self' https: *.googleapis.com *.google.com *.firebaseio.com *.firebaseapp.com",
  "font-src 'self' data: *.gstatic.com",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // microphone=(self) so the optional voice-input hook (lib/useVoiceInput) works; tighten if unused.
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
