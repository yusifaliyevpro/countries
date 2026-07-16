import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "import", "jest", "jsdoc"],
  categories: {
    suspicious: "warn",
  },
  ignorePatterns: ["dist"],
  rules: {
    eqeqeq: "error",
    "no-throw-literal": "warn",
    "unicorn/prefer-node-protocol": "error",
    "typescript/consistent-type-imports": "warn",
  },
});
