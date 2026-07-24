import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// One-shot unit tests on the pure core logic. Run with `npm test` — exits, never watches.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
