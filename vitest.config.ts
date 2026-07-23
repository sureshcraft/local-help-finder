import { defineConfig } from "vitest/config";

// One-shot unit tests on the pure core logic (strict-JSON parsing, deterministic-first,
// deterministic maths, Google deep-links). Run with `npm test` — exits, never watches.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
