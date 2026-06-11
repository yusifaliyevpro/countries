import { API_BASE_URL } from "./constants";
import type { Capital, Country, CountryList, CountryPicker, Currency, Lang, Region, ResponseMeta, Subregion } from "./types";
import type { Code } from "./types/common";

/**
 * Configuration for a {@link RestCountries} client instance.
 */
export type RestCountriesConfig = {
  /**
   * Your REST Countries API key. Sent as `Authorization: Bearer <apiKey>` on
   * every request. Get one at https://restcountries.com/sign-up.
   */
  apiKey: string;
  /** Override the API base URL. Defaults to the v5 endpoint. */
  baseURL?: string;
  /** Custom `fetch` implementation (e.g. for testing or a polyfill). */
  fetch?: typeof fetch;
};

type Fields = readonly (keyof Country)[];

/** Picks only the `boolean`-valued keys of `T`, all optional. */
type BooleanFlags<T> = { [K in keyof T as T[K] extends boolean ? K : never]?: boolean };

/**
 * Typed, composable property filters for {@link RestCountries.getCountries}.
 * Every provided filter is AND-combined into the request.
 */
export type CountryFilters = {
  /** e.g. `"Europe"`, `"Asia"`. */
  region?: Region;
  /** e.g. `"Northern Europe"`. */
  subregion?: Subregion;
  /** Matches countries whose `continents` include this value (e.g. `"Europe"`). */
  continent?: string;
  landlocked?: boolean;
  /** Sovereignty / UN status flags (`sovereign`, `un_member`, `disputed`, …). */
  classification?: BooleanFlags<Country["classification"]>;
  /** Organisation memberships (`eu`, `nato`, `un`, `schengen`, `g7`, …). */
  memberships?: BooleanFlags<Country["memberships"]>;
};

/** Field selection shared by every endpoint. */
type Selection<T extends Fields> = {
  /** Top-level fields to include (maps to `response_fields`). */
  fields?: T;
  /** Top-level fields to exclude (maps to `response_fields_omit`). Not reflected in the return type. */
  omitFields?: Fields;
};

/** Pagination options shared by every list endpoint. */
type Pagination = {
  /** Max results per request (1–100). The API defaults to 25. */
  limit?: number;
  /** Number of records to skip. The API defaults to 0. */
  offset?: number;
};

type RequestParams<T extends Fields> = { q?: string; filters?: CountryFilters } & Selection<T> & Pagination;

type RawEnvelope<C> = {
  data?: { objects?: (C & { _match?: unknown; _meta?: unknown })[]; meta?: ResponseMeta };
  errors?: { message: string }[];
};

function appendFilters(search: URLSearchParams, filters: CountryFilters): void {
  const { region, subregion, continent, landlocked, classification, memberships } = filters;
  if (region !== undefined) search.set("region", region);
  if (subregion !== undefined) search.set("subregion", subregion);
  if (continent !== undefined) search.set("continents", continent);
  if (landlocked !== undefined) search.set("landlocked", String(landlocked));
  for (const [key, value] of Object.entries(classification ?? {})) {
    if (value !== undefined) search.set(`classification.${key}`, String(value));
  }
  for (const [key, value] of Object.entries(memberships ?? {})) {
    if (value !== undefined) search.set(`memberships.${key}`, String(value));
  }
}

function handleNotFound(): void {
  console.error(
    "Couldn't find any country that matches your query. If you think this is a bug, please report it via GitHub issues: https://github.com/yusifaliyevpro/countries",
  );
}

function handleNetworkError(error: unknown): void {
  console.warn("A network or REST Countries API side error happened while fetching data. Try again later.");
  console.warn(
    "If this error persists, please verify the status of the REST Countries API. If the issue continues, feel free to report it on GitHub: https://github.com/yusifaliyevpro/countries",
  );
  console.error(error);
}

/**
 * A typed client for the REST Countries **v5** API.
 *
 * Instantiate it once with your API key, then call its methods anywhere — no
 * need to thread the key through every call.
 *
 * @example
 * const restCountries = new RestCountries({ apiKey: process.env.REST_COUNTRIES_API_KEY! });
 *
 * const canada = await restCountries.getCountryByCode({ code: "CAN", fields: ["names", "capitals"] });
 * const { countries } = await restCountries.getCountries({ filters: { region: "Europe", memberships: { eu: true } } });
 */
export class RestCountries {
  readonly #apiKey: string;
  readonly #baseURL: string;
  readonly #fetch: typeof fetch;

  constructor(config: RestCountriesConfig) {
    if (!config?.apiKey) throw new Error("RestCountries: `apiKey` is required. Get one at https://restcountries.com/sign-up");
    this.#apiKey = config.apiKey;
    this.#baseURL = config.baseURL ?? API_BASE_URL;
    this.#fetch = config.fetch ?? globalThis.fetch;
  }

  /**
   * Performs a request against the v5 API and unwraps the `data` envelope.
   * Returns `null` on a not-found / network / auth error (after logging).
   */
  async #request<T extends Fields>(
    path: string,
    params: RequestParams<T>,
    fetchOptions?: RequestInit,
  ): Promise<{ countries: CountryPicker<T>[]; meta: ResponseMeta } | null> {
    try {
      const url = new URL(this.#baseURL.replace(/\/$/, "") + path);
      if (params.q !== undefined) url.searchParams.set("q", params.q);
      if (params.limit !== undefined) url.searchParams.set("limit", String(params.limit));
      if (params.offset !== undefined) url.searchParams.set("offset", String(params.offset));
      if (params.filters) appendFilters(url.searchParams, params.filters);
      const fields = params.fields && Array.from(new Set(params.fields));
      if (fields && fields.length) url.searchParams.set("response_fields", fields.join(","));
      const omit = params.omitFields && Array.from(new Set(params.omitFields));
      if (omit && omit.length) url.searchParams.set("response_fields_omit", omit.join(","));

      const response = await this.#fetch(url.toString(), {
        ...fetchOptions,
        headers: { Authorization: `Bearer ${this.#apiKey}`, ...fetchOptions?.headers },
      });

      if (response.status === 401 || response.status === 403) {
        console.error("REST Countries: authentication failed. Check that your `apiKey` is valid and active.");
        return null;
      }

      const body = (await response.json()) as RawEnvelope<CountryPicker<T>>;
      if (!response.ok || !body.data?.objects) {
        handleNotFound();
        return null;
      }

      // Strip the per-result `_match` / `_meta` search annotations so callers
      // get clean Country objects matching the typed shape.
      const countries = body.data.objects.map(({ _match, _meta, ...country }) => country as CountryPicker<T>);
      const meta = body.data.meta ?? {
        total: countries.length,
        count: countries.length,
        limit: countries.length,
        offset: 0,
        more: false,
        request_id: "",
        duration: 0,
      };
      return { countries, meta };
    } catch (error) {
      handleNetworkError(error);
      return null;
    }
  }

  /** Like {@link RestCountries.#request} but returns only the first matching country. */
  async #first<T extends Fields>(
    path: string,
    params: RequestParams<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryPicker<T> | null> {
    const result = await this.#request<T>(path, { ...params, limit: 1 }, fetchOptions);
    return result?.countries[0] ?? null;
  }

  /**
   * Fetches countries, optionally narrowed by composable {@link CountryFilters}
   * and/or a free-text `q`, with pagination. With no arguments it lists all
   * countries (paginated).
   *
   * @example
   * // EU countries that are landlocked
   * const { countries } = await restCountries.getCountries({
   *   filters: { region: "Europe", landlocked: true, memberships: { eu: true } },
   *   fields: ["names"],
   * });
   */
  async getCountries<T extends Fields>(
    { q, filters, fields, omitFields, limit, offset }: { q?: string; filters?: CountryFilters } & Selection<T> & Pagination = {},
    fetchOptions?: RequestInit,
  ): Promise<CountryList<T> | null> {
    return this.#request<T>("", { q, filters, fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Free-text search across all searchable properties (the v5 `?q=` endpoint).
   * Optionally narrowed by {@link CountryFilters}.
   *
   * @example
   * const { countries } = await restCountries.search("island", { filters: { region: "Oceania" }, fields: ["names"] });
   */
  async search<T extends Fields>(
    q: string,
    { filters, fields, omitFields, limit, offset }: { filters?: CountryFilters } & Selection<T> & Pagination = {},
    fetchOptions?: RequestInit,
  ): Promise<CountryList<T> | null> {
    return this.#request<T>("", { q, filters, fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches a single country by its code (alpha-2, alpha-3, CCN3 or CIOC).
   * Tries the exact-match route for the detected code type, falling back to
   * CIOC for three-letter codes.
   *
   * @example
   * const usa = await restCountries.getCountryByCode({ code: "USA", fields: ["names", "flag"] });
   */
  async getCountryByCode<T extends Fields>(
    { code, fields, omitFields }: { code: Code } & Selection<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryPicker<T> | null> {
    const value = String(code).trim();
    let property: string;
    if (/^\d+$/.test(value)) property = "codes.ccn3";
    else if (value.length === 2) property = "codes.alpha_2";
    else property = "codes.alpha_3";

    const country = await this.#first<T>(`/${property}/${encodeURIComponent(value)}`, { fields, omitFields }, fetchOptions);
    if (country || property !== "codes.alpha_3") return country;
    // Three-letter code that isn't an alpha-3 — it may be a CIOC code (e.g. "SUI").
    return this.#first<T>(`/codes.cioc/${encodeURIComponent(value)}`, { fields, omitFields }, fetchOptions);
  }

  /**
   * Fetches countries matching a name. Searches common, official, alternate and
   * native names. Set `fullText` to require an exact common-name match.
   *
   * @example
   * const { countries } = await restCountries.getCountriesByName({ name: "united", fields: ["names"] });
   * const finland = await restCountries.getCountriesByName({ name: "Finland", fullText: true });
   */
  async getCountriesByName<T extends Fields>(
    { name, fullText, fields, omitFields, limit, offset }: { name: string; fullText?: boolean } & Selection<T> & Pagination,
    fetchOptions?: RequestInit,
  ): Promise<CountryList<T> | null> {
    const path = fullText ? `/names.common/${encodeURIComponent(name)}` : "/name";
    return this.#request<T>(path, { q: fullText ? undefined : name, fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches countries in the given region (e.g. "Europe", "Asia").
   *
   * @example
   * const { countries } = await restCountries.getCountriesByRegion({ region: "Europe", fields: ["names"] });
   */
  async getCountriesByRegion<T extends Fields>(
    { region, fields, omitFields, limit, offset }: { region: Region } & Selection<T> & Pagination,
    fetchOptions?: RequestInit,
  ): Promise<CountryList<T> | null> {
    return this.#request<T>(`/region/${encodeURIComponent(region)}`, { fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches countries in the given subregion (e.g. "Northern Europe").
   *
   * @example
   * const { countries } = await restCountries.getCountriesBySubregion({ subregion: "Northern Europe" });
   */
  async getCountriesBySubregion<T extends Fields>(
    { subregion, fields, omitFields, limit, offset }: { subregion: Subregion } & Selection<T> & Pagination,
    fetchOptions?: RequestInit,
  ): Promise<CountryList<T> | null> {
    return this.#request<T>(`/subregion/${encodeURIComponent(subregion)}`, { fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches countries where the given language is spoken (matches by language name).
   *
   * @example
   * const { countries } = await restCountries.getCountriesByLang({ lang: "Spanish", fields: ["names"] });
   */
  async getCountriesByLang<T extends Fields>(
    { lang, fields, omitFields, limit, offset }: { lang: Lang } & Selection<T> & Pagination,
    fetchOptions?: RequestInit,
  ): Promise<CountryList<T> | null> {
    return this.#request<T>("/languages", { q: lang as string, fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches countries that use the given currency (matches by currency code or name).
   *
   * @example
   * const { countries } = await restCountries.getCountriesByCurrency({ currency: "EUR", fields: ["names"] });
   */
  async getCountriesByCurrency<T extends Fields>(
    { currency, fields, omitFields, limit, offset }: { currency: Currency } & Selection<T> & Pagination,
    fetchOptions?: RequestInit,
  ): Promise<CountryList<T> | null> {
    return this.#request<T>("/currencies", { q: currency as string, fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches a single country by its capital city.
   *
   * @example
   * const japan = await restCountries.getCountryByCapital({ capital: "Tokyo", fields: ["names"] });
   */
  async getCountryByCapital<T extends Fields>(
    { capital, fields, omitFields }: { capital: Capital } & Selection<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryPicker<T> | null> {
    return this.#first<T>("/capitals", { q: capital as string, fields, omitFields }, fetchOptions);
  }

  /**
   * Fetches a single country by demonym (e.g. "Canadian", "French").
   *
   * @example
   * const canada = await restCountries.getCountryByDemonym({ demonym: "Canadian", fields: ["names"] });
   */
  async getCountryByDemonym<T extends Fields>(
    { demonym, fields, omitFields }: { demonym: string } & Selection<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryPicker<T> | null> {
    return this.#first<T>("/demonyms", { q: demonym, fields, omitFields }, fetchOptions);
  }

  /**
   * Fetches a single country by a translated name (e.g. "Deutschland", "Alemania").
   *
   * @example
   * const germany = await restCountries.getCountryByTranslation({ translation: "Deutschland", fields: ["names"] });
   */
  async getCountryByTranslation<T extends Fields>(
    { translation, fields, omitFields }: { translation: string } & Selection<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryPicker<T> | null> {
    return this.#first<T>("/names.translations", { q: translation, fields, omitFields }, fetchOptions);
  }
}
