import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/types/index.ts"],
    format: ["esm"],
    dts: true, // Generate declaration file (.d.ts)
    sourcemap: false,
    clean: true,
    // minify: true,
    unused: true,
    outDir: "dist",
  },
]);
