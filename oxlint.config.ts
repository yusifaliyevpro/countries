import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "import"],
  categories: {
    suspicious: "warn",
  },
  ignorePatterns: ["dist"],
  rules: {
    eqeqeq: "warn",
    "no-throw-literal": "warn",
    "unicorn/prefer-node-protocol": "warn",
    "typescript/consistent-type-imports": "warn",
  },
});
