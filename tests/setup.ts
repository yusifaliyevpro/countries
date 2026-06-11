import "dotenv/config";

if (!process.env.REST_COUNTRIES_API_KEY) {
  throw new Error("REST_COUNTRIES_API_KEY is not set. Add it to .env or the environment to run the tests.");
}
