import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 130,
  singleQuote: false,
  insertFinalNewline: true,
  sortImports: {
    newlinesBetween: false,
  },
});
