import type { ResponseMeta } from "./types";

export const NOT_FOUND_MESSAGE =
  "Couldn't find any country that matches your query. If you think this is a bug, please report it via GitHub issues: https://github.com/yusifaliyevpro/countries";

/** The raw v5 response envelope (`{ data: { objects, meta } }` or `{ errors }`). */
export type RawEnvelope<C> = {
  data?: { objects?: (C & { _match?: unknown; _meta?: unknown })[]; meta?: ResponseMeta };
  errors?: { message: string }[];
};

/**
 * Structured detail attached to a failed request's `error.cause` for
 * programmatic handling (e.g. `(error.cause as ErrorCause).status === 429`).
 */
export type ErrorCause = { status: number; statusText: string; body: unknown; headers: Record<string, string> };

/** Wraps any object as a successful result: `{ ...value, success: true, error: undefined }`. */
export function ok<T extends object>(value: T): T & { success: true; error: undefined } {
  return { ...value, success: true, error: undefined };
}

/** The failure branch of a `CountryListResult`. */
export function countryListFailure(error: Error): {
  success: false;
  countries: undefined;
  meta: undefined;
  error: Error;
} {
  return { success: false, countries: undefined, meta: undefined, error };
}

/** The failure branch of a `CountryResult`. */
export function countryFailure(error: Error): { success: false; country: undefined; error: Error } {
  return { success: false, country: undefined, error };
}

/**
 * Generic failure branch for the currency results: `{ success: false, error }`
 * plus each named data key set to `undefined`, so the discriminated union
 * narrows correctly on `success` (e.g. `failure(err, "conversions")`).
 */
export function failure<K extends string>(error: Error, ...keys: K[]): { success: false; error: Error } & Record<K, undefined> {
  const result: Record<string, unknown> = { success: false, error };
  for (const key of keys) result[key] = undefined;
  return result as { success: false; error: Error } & Record<K, undefined>;
}

/**
 * Builds an `Error` that carries everything the server reported: a status-aware
 * summary, **all** of the API's error messages, and the raw payload + status on
 * `error.cause` (typed as {@link ErrorCause}) for programmatic handling.
 */
export function errorFromResponse(response: Response, body: RawEnvelope<unknown> | undefined, rawText: string): Error {
  // Every message the server sent (v5 returns `{ errors: [{ message }] }`).
  const serverMessages = (body?.errors ?? []).map((e) => e?.message).filter((m): m is string => Boolean(m));
  // Fall back to the raw (possibly non-JSON, e.g. HTML/plain-text) body.
  const detail = serverMessages.length ? serverMessages.join("; ") : rawText.trim().slice(0, 1000);

  let summary: string;
  switch (response.status) {
    case 400:
      summary = "bad request — a query parameter failed validation (e.g. empty `q`, or `limit` outside 1–100)";
      break;
    case 401:
      summary = "unauthorized — the `apiKey` is missing, unrecognized, revoked, or expired";
      break;
    case 403:
      summary =
        "forbidden — the account is frozen (e.g. monthly request limit reached) or a premium field was requested on a Free plan";
      break;
    case 404:
      summary = serverMessages.length
        ? "not found — unknown endpoint, or the property isn't readable/searchable"
        : NOT_FOUND_MESSAGE;
      break;
    case 405:
      summary = "method not allowed — REST Countries endpoints are GET-only";
      break;
    case 410:
      summary = "this REST Countries API version is no longer active — update this package";
      break;
    case 429: {
      const retryAfter = response.headers.get("retry-after");
      summary = `rate limit exceeded${retryAfter ? ` — retry after ${retryAfter}s` : " — slow down or upgrade your plan"}`;
      break;
    }
    case 500:
      summary = "REST Countries server error — try again later";
      break;
    default:
      summary = response.ok ? "unexpected response shape" : "request failed";
  }

  const status = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
  const message = `REST Countries: ${summary} (${status})${detail && detail !== summary ? ` — ${detail}` : ""}`;
  const cause: ErrorCause = {
    status: response.status,
    statusText: response.statusText,
    body: body ?? rawText,
    headers: Object.fromEntries(response.headers),
  };
  return new Error(message, { cause });
}
