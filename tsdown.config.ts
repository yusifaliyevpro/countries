import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/types/index.ts"],
    format: ["cjs", "esm"], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    sourcemap: false,
    clean: true,
    // minify: true,
    unused: true,
    outDir: "dist",
  },
]);
