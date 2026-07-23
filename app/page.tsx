import AgentDemo from "./AgentDemo";

// ── STARTER SHELL ────────────────────────────────────────────────────────────
// This runs out of the box to prove the Gemini pipeline works.
// On the day, reshape the hero copy + <AgentDemo/> into your golden flow.
// Keep it: light, clean, one accent (emerald), accessible. Demo legible in 60 seconds.
export default function Home() {
  return (
    <>
      {/* Accessibility: skip link is the first focusable element (Accessibility axis). */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        className="flex min-h-screen flex-col items-center justify-center gap-10 bg-neutral-50 px-6 py-16"
      >
        <div className="max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            PromptWars · Build environment
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
            One flow. Shipped. <span className="text-emerald-600">Best in the room.</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-500">
            Replace this hero and the panel below with your secret-challenge solution.
            The Gemini pipeline is already wired — start building the flow, not the plumbing.
          </p>
        </div>

        <AgentDemo />

        <p className="text-sm text-neutral-400">
          Wired: Next.js · Gemini (<code>lib/gemini.ts</code>) · API route (<code>/api/agent</code>).
          See <code>AGENTS.md</code>.
        </p>
      </main>
    </>
  );
}
