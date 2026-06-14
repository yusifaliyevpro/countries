import { RestCountries } from "@yusifaliyevpro/countries";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * `fetch` that retries on `429 Too Many Requests` (the API's per-second edge
 * rate limit) with exponential backoff. This lives only in the test client — the
 * library stays unopinionated; real apps choose their own retry strategy.
 */
const retryingFetch: typeof fetch = async (input, init) => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(input, init);
    if (response.status !== 429 || attempt >= 5) return response;
    await response.body?.cancel(); // free the connection before retrying
    await sleep(Math.min(1000 * 2 ** attempt, 5000)); // 1s, 2s, 4s, 5s, 5s
  }
};

/** Shared client used across the test suite (with 429 retry so CI stays green). */
export const rc = new RestCountries({
  apiKey: process.env.REST_COUNTRIES_API_KEY as string,
  fetch: retryingFetch,
});
