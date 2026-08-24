import { defineConfig } from "greenly";
import { checkDataSorted, sortData } from "./scripts/sort-data";

export default defineConfig({
  name: "@yusifaliyevpro/countries",
  checks: [
    { name: "TypeScript", command: "pnpm tsc" },
    { name: "Sorted data", command: checkDataSorted, onFail: sortData },
    { name: "Oxfmt", command: "pnpm fmt:check", onFail: "pnpm fmt" },
    { name: "Oxlint", command: "pnpm lint" },
    { name: "Tests", command: "pnpm test" },
    { name: "Build", command: "pnpm build" },
  ],
});
