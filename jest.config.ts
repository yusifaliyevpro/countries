import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@yusifaliyevpro/countries$": "<rootDir>/dist/index.cjs",
  },
};

export default config;
