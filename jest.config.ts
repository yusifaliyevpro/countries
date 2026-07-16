import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Cap workers to minimize request bursts; the test client also retries 429s
  // (tests/client.ts), and testTimeout gives that backoff room.
  testTimeout: 30_000,
  setupFiles: ["<rootDir>/tests/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/client.ts", "<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@yusifaliyevpro/countries$": "<rootDir>/dist/index.cjs",
  },
};

export default config;
