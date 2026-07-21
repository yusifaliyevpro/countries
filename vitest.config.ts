import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // tests call bare `test` / `expect` without importing them
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"], // client.ts / setup.ts are helpers, not suites
    // Files run fully parallel. Cache hits do no network I/O at all, and real
    // requests are held under Cloudflare's 20-per-10s cap by the cross-process
    // rate limiter in tests/client.ts — so parallelism costs nothing either way.
    testTimeout: 30_000,
    // `expectTypeof` assertions are erased at runtime — they only ever fail
    // through a type checker. Enabling this runs tsc alongside the suite, and
    // the include override is required because typecheck defaults to matching
    // `*.test-d.ts` only, which would silently skip every file below.
    typecheck: {
      enabled: true,
      include: ["tests/**/*.test.ts"],
      tsconfig: "./tests/tsconfig.json",
    },
    // Resolve the package to source, not to dist: no build step before a run,
    // real stack traces (tsdown emits no sourcemaps), and watch mode that
    // actually reacts to src/ edits.
    alias: {
      "@yusifaliyevpro/countries": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
    },
  },
});
