import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/client.ts", "<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@yusifaliyevpro/countries$": "<rootDir>/dist/index.cjs",
  },
};

export default config;
