import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    typecheck: {
      enabled: true,
      include: ["tests/**/*.test.ts"],
      tsconfig: "./tests/tsconfig.json",
    },
    alias: {
      "@yusifaliyevpro/countries": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
    },
  },
});
