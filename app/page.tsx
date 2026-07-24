import FindDemo from "./FindDemo";

// Local Help Finder — messy real-world need → ranked, located local-service cards.
// Rehearsal build (kitchen-sink): Vertex Gemini + embeddings, Firestore vector search,
// deterministic budget/distance, Maps embed + Calendar action.
export default function Home() {
  return (
    <>
      {/* Accessibility: skip link is the first focusable element. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        className="flex min-h-screen flex-col items-center gap-10 bg-neutral-50 px-6 py-16"
      >
        <div className="max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Local Help Finder · Chennai
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
            Tell us the problem. <span className="text-emerald-600">We find the help.</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-500">
            Describe a real-world need in plain words. We match it to nearby local services,
            within budget, with a map and a one-click appointment.
          </p>
        </div>

        <FindDemo />
      </main>
    </>
  );
}
