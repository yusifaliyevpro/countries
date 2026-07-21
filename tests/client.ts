import { createHash } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RestCountries } from "@yusifaliyevpro/countries";

/** Gitignored scratch dir holding both the response cache and the rate-limit ledger. */
const CACHE_ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), ".cache");

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

// Cloudflare in front of the API allows 20 requests per 10 seconds; going over
// earns a 429. One under the cap leaves room for the odd retry.
const WINDOW_MS = 10_000;
const MAX_PER_WINDOW = 19;

// The window lives on disk rather than in memory because Vitest runs test files
// in separate worker processes — an in-process counter would give every worker
// its own budget and blow straight past the cap. A lock file serializes access
// so two workers can't claim the same slot.
const LEDGER_PATH = resolve(CACHE_ROOT, "rate-limit.json");
const LOCK_PATH = resolve(CACHE_ROOT, "rate-limit.lock");
const STALE_LOCK_MS = 5_000;

/** Takes the lock, or returns null if another process holds it. Breaks locks left by a crashed run. */
function tryLock(): number | null {
  try {
    return openSync(LOCK_PATH, "wx"); // `wx` fails if the file exists — atomic across processes
  } catch {
    try {
      if (Date.now() - statSync(LOCK_PATH).mtimeMs > STALE_LOCK_MS) unlinkSync(LOCK_PATH);
    } catch {
      // lost the race to another process's cleanup; just retry
    }
    return null;
  }
}

/**
 * Waits until dispatching now would keep the last 10 seconds under the cap.
 *
 * The window slides: aged-out timestamps are dropped, and when the window is
 * full the caller sleeps exactly until the oldest one expires rather than for a
 * fixed interval. A burst of 19 goes out at once; the 20th waits only as long as
 * it must. The lock is always released before sleeping, so a waiting worker
 * never blocks one that still has budget.
 */
async function reserveSlot(): Promise<void> {
  mkdirSync(CACHE_ROOT, { recursive: true });
  for (;;) {
    const fd = tryLock();
    if (fd === null) {
      await sleep(10 + Math.random() * 20); // jitter so contenders don't sync up
      continue;
    }

    let waitMs = 0;
    try {
      const now = Date.now();
      let times: number[] = [];
      try {
        times = JSON.parse(readFileSync(LEDGER_PATH, "utf8")) as number[];
      } catch {
        // no ledger yet, or a torn write — start the window over
      }
      times = times.filter((t) => now - t < WINDOW_MS);
      if (times.length < MAX_PER_WINDOW) {
        times.push(now);
        writeFileSync(LEDGER_PATH, JSON.stringify(times));
      } else {
        waitMs = Math.max(1, (times[0] as number) + WINDOW_MS - now);
      }
    } finally {
      closeSync(fd);
      try {
        unlinkSync(LOCK_PATH);
      } catch {
        // already broken as stale by another process
      }
    }

    if (waitMs === 0) return;
    await sleep(waitMs);
  }
}

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

// On-disk response cache, keyed by request. Lets the suite run offline and keeps
// it off the API's request cap. Delete tests/.cache to force every request to go
// back to the live API.
const CACHE_DIR = resolve(CACHE_ROOT, "responses");

type CachedResponse = { url: string; status: number; statusText: string; headers: [string, string][]; body: string };

/**
 * Cache key. Method + URL only: the `Authorization` header is identical on every
 * request, so leaving it out keeps the API key out of the cache entirely.
 */
function cacheKey(method: string, url: string): string {
  return `${createHash("sha256").update(`${method} ${url}`).digest("hex").slice(0, 32)}.json`;
}

/**
 * Responses worth persisting. 2xx and deterministic 4xx (a bad country code
 * answers the same way forever) are cacheable. 429s and 5xx are transport noise,
 * and 401/403 depend on the key rather than the request — caching either kind
 * would poison the cache with a failure that then survives the fix.
 */
function isCacheable(status: number): boolean {
  return status < 500 && status !== 429 && status !== 401 && status !== 403;
}

/**
 * `retryingFetch` wrapped in a read-through disk cache and the rate limiter. A
 * cache hit does no network I/O and takes no slot, so a warm suite runs offline,
 * unthrottled, and in milliseconds — only real requests are paced.
 */
const cachingFetch: typeof fetch = async (input, init) => {
  const request = new Request(input as RequestInfo, init);
  if (request.method !== "GET") return retryingFetch(input, init);

  const path = resolve(CACHE_DIR, cacheKey(request.method, request.url));

  if (existsSync(path)) {
    const hit = JSON.parse(readFileSync(path, "utf8")) as CachedResponse;
    return new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers: hit.headers });
  }

  await reserveSlot();
  const response = await retryingFetch(input, init);
  if (!isCacheable(response.status)) return response;

  // Buffer the body so it can be both cached and handed to the caller.
  const body = await response.clone().text();
  const entry: CachedResponse = {
    url: request.url,
    status: response.status,
    statusText: response.statusText,
    headers: [...response.headers],
    body,
  };
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(path, JSON.stringify(entry));
  return response;
};

/** Shared client used across the test suite (disk-cached, with 429 retry so CI stays green). */
export const rc = new RestCountries({
  apiKey: process.env.REST_COUNTRIES_API_KEY as string,
  fetch: cachingFetch,
});
