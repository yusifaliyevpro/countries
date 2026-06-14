import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Cap parallel workers so concurrent API calls stay under the REST Countries
  // edge rate limit (Cloudflare rejects sustained traffic above 20 requests/second).
  maxWorkers: 3,
  setupFiles: ["<rootDir>/tests/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/client.ts", "<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@yusifaliyevpro/countries$": "<rootDir>/dist/index.cjs",
  },
};

export default config;
