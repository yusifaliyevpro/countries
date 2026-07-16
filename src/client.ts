import { API_BASE_URL, CURRENCIES_BASE_URL } from "./constants";
import {
  countryFailure,
  errorFromResponse,
  countryListFailure,
  failure,
  NOT_FOUND_MESSAGE,
  ok,
  type RawEnvelope,
} from "./helpers";
import type {
  Capital,
  Alpha_2Code,
  Alpha_3Code,
  Ccn3Code,
  CiocCode,
  Country,
  CountryListResult,
  CountryPicker,
  CountryResult,
  CurrenciesResult,
  Currency,
  CurrencyCode,
  CurrencyConversion,
  CurrencyConvertResult,
  CurrencyName,
  CurrencyRates,
  CurrencyRatesResult,
  Language,
  Region,
  Subregion,
} from "./types";

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
  /** Override the Currencies API base URL. Defaults to the currencies v1 endpoint. */
  currenciesBaseURL?: string;
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

/**
 * Identifies a country by **exactly one** code type. Providing zero or more than
 * one key is a type error.
 *
 * @example
 * { alpha_3: "USA" }   // ISO 3166-1 alpha-3
 * { alpha_2: "US" }    // ISO 3166-1 alpha-2
 * { ccn3: "840" }      // ISO 3166-1 numeric
 * { cioc: "USA" }      // IOC code
 */
export type CountryCodeQuery =
  | { alpha_2: Alpha_2Code; alpha_3?: never; ccn3?: never; cioc?: never }
  | { alpha_3: Alpha_3Code; alpha_2?: never; ccn3?: never; cioc?: never }
  | { ccn3: Ccn3Code; alpha_2?: never; alpha_3?: never; cioc?: never }
  | { cioc: CiocCode; alpha_2?: never; alpha_3?: never; ccn3?: never };

/** Field selection shared by every endpoint. */
type Selection<T extends Fields> = {
  /** Top-level fields to include (maps to `response_fields`). */
  fields?: T;
  /** Top-level fields to exclude (maps to `response_fields_omit`). Not reflected in the return type. */
  omitFields?: Fields;
};

/** Pagination options shared by every list endpoint. */
type Pagination = {
  /** Max results per request (1–100 for free Plan, 500 for paid Plans). The API defaults to 25. */
  limit?: number;
  /** Number of records to skip. The API defaults to 0. */
  offset?: number;
};

type RequestParams<T extends Fields> = { q?: string; filters?: CountryFilters } & Selection<T> & Pagination;

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

/**
 * A typed client for the REST Countries **v5** API.
 *
 * Instantiate it once with your API key, then call its methods anywhere — no
 * need to thread the key through every call.
 *
 * @example
 * const restCountries = new RestCountries({ apiKey: process.env.REST_COUNTRIES_API_KEY! });
 *
 * const { success, country, error } = await restCountries.getCountryByCode({ alpha_3: "CAN", fields: ["names"] });
 * if (!success) throw error;
 * console.log(country.names.common);
 */
export class RestCountries {
  readonly #apiKey: string;
  readonly #baseURL: string;
  readonly #currenciesBaseURL: string;
  readonly #fetch: typeof fetch;

  constructor(config: RestCountriesConfig) {
    const apiKey = config?.apiKey?.trim();
    if (!apiKey) {
      throw new Error("RestCountries: `apiKey` is required and cannot be empty. Get one at https://restcountries.com/sign-up");
    }
    this.#apiKey = apiKey;
    this.#baseURL = config.baseURL ?? API_BASE_URL;
    this.#currenciesBaseURL = config.currenciesBaseURL ?? CURRENCIES_BASE_URL;
    this.#fetch = config.fetch ?? globalThis.fetch;
  }

  /**
   * Performs a request against the v5 API and unwraps the `data` envelope into
   * a {@link CountryListResult}. Never throws — failures are returned as
   * `{ success: false, error }`.
   */
  async #request<T extends Fields>(
    path: string,
    params: RequestParams<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryListResult<T>> {
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

      // Read as text first so a non-JSON error body (HTML 500, plain-text rate
      // limit, …) doesn't throw and lose the status — we surface it instead.
      const rawText = await response.text();
      let body: RawEnvelope<CountryPicker<T>> | undefined;
      try {
        body = rawText ? (JSON.parse(rawText) as RawEnvelope<CountryPicker<T>>) : undefined;
      } catch {
        body = undefined;
      }

      if (!response.ok || !body?.data?.objects) {
        return countryListFailure(errorFromResponse(response, body, rawText));
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
      return ok({ countries, meta });
    } catch (error) {
      return countryListFailure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /** Like {@link RestCountries.#request} but resolves to a single-country {@link CountryResult}. */
  async #first<T extends Fields>(path: string, params: RequestParams<T>, fetchOptions?: RequestInit): Promise<CountryResult<T>> {
    const result = await this.#request<T>(path, { ...params, limit: 1 }, fetchOptions);
    if (!result.success) return countryFailure(result.error);
    const country = result.countries[0];
    if (!country) return countryFailure(new Error(NOT_FOUND_MESSAGE));
    return ok({ country });
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
  ): Promise<CountryListResult<T>> {
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
  ): Promise<CountryListResult<T>> {
    return this.#request<T>("", { q, filters, fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches a single country by **one** code, identified by its kind. Pass
   * exactly one of `alpha_2`, `alpha_3`, `ccn3`, or `cioc` (see {@link CountryCodeQuery}).
   *
   * @example
   * const { success, country, error } = await restCountries.getCountryByCode({ alpha_3: "USA", fields: ["names", "flag"] });
   * if (success) console.log(country.names.common);
   *
   * @example
   * await restCountries.getCountryByCode({ cioc: "SUI" }); // Switzerland by IOC code
   */
  async getCountryByCode<T extends Fields>(
    { alpha_2, alpha_3, ccn3, cioc, fields, omitFields }: CountryCodeQuery & Selection<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryResult<T>> {
    const codes = [
      ["codes.alpha_2", alpha_2],
      ["codes.alpha_3", alpha_3],
      ["codes.ccn3", ccn3],
      ["codes.cioc", cioc],
    ] as const;
    const match = codes.find(([, value]) => value !== undefined);

    if (!match) {
      return countryFailure(
        new Error("RestCountries: provide exactly one country code — `alpha_2`, `alpha_3`, `ccn3`, or `cioc`."),
      );
    }
    const [property, value] = match;
    return this.#first<T>(`/${property}/${encodeURIComponent(String(value))}`, { fields, omitFields }, fetchOptions);
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
  ): Promise<CountryListResult<T>> {
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
  ): Promise<CountryListResult<T>> {
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
  ): Promise<CountryListResult<T>> {
    return this.#request<T>(`/subregion/${encodeURIComponent(subregion)}`, { fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches countries where the given language is spoken (matches by language name).
   *
   * @example
   * const { countries } = await restCountries.getCountriesByLang({ lang: "Spanish", fields: ["names"] });
   */
  async getCountriesByLang<T extends Fields>(
    { lang, fields, omitFields, limit, offset }: { lang: Language } & Selection<T> & Pagination,
    fetchOptions?: RequestInit,
  ): Promise<CountryListResult<T>> {
    return this.#request<T>("/languages", { q: lang as string, fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches countries that use the given currency (matches by currency code or name).
   *
   * @example
   * const { countries } = await restCountries.getCountriesByCurrency({ currency: "EUR", fields: ["names"] });
   */
  async getCountriesByCurrency<T extends Fields>(
    { currency, fields, omitFields, limit, offset }: { currency: CurrencyName } & Selection<T> & Pagination,
    fetchOptions?: RequestInit,
  ): Promise<CountryListResult<T>> {
    return this.#request<T>("/currencies", { q: currency as string, fields, omitFields, limit, offset }, fetchOptions);
  }

  /**
   * Fetches a single country by its capital city.
   *
   * @example
   * const { success, country } = await restCountries.getCountryByCapital({ capital: "Tokyo", fields: ["names"] });
   */
  async getCountryByCapital<T extends Fields>(
    { capital, fields, omitFields }: { capital: Capital } & Selection<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryResult<T>> {
    return this.#first<T>("/capitals", { q: capital as string, fields, omitFields }, fetchOptions);
  }

  /**
   * Fetches a single country by demonym (e.g. "Canadian", "French").
   *
   * @example
   * const { success, country } = await restCountries.getCountryByDemonym({ demonym: "Canadian", fields: ["names"] });
   */
  async getCountryByDemonym<T extends Fields>(
    { demonym, fields, omitFields }: { demonym: string } & Selection<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryResult<T>> {
    return this.#first<T>("/demonyms", { q: demonym, fields, omitFields }, fetchOptions);
  }

  /**
   * Fetches a single country by a translated name (e.g. "Deutschland", "Alemania").
   *
   * @example
   * const { success, country } = await restCountries.getCountryByTranslation({ translation: "Deutschland", fields: ["names"] });
   */
  async getCountryByTranslation<T extends Fields>(
    { translation, fields, omitFields }: { translation: string } & Selection<T>,
    fetchOptions?: RequestInit,
  ): Promise<CountryResult<T>> {
    return this.#first<T>("/names.translations", { q: translation, fields, omitFields }, fetchOptions);
  }

  /**
   * Performs a GET against the Currencies API and unwraps the `data.objects`
   * envelope. Never throws — failures are returned as `{ success: false, error }`.
   */
  async #currencyRequest<C>(
    path: string,
    search: URLSearchParams,
    fetchOptions?: RequestInit,
  ): Promise<{ success: true; objects: C[] } | { success: false; error: Error }> {
    try {
      const url = new URL(this.#currenciesBaseURL.replace(/\/$/, "") + path);
      search.forEach((value, key) => url.searchParams.set(key, value));

      const response = await this.#fetch(url.toString(), {
        ...fetchOptions,
        headers: { Authorization: `Bearer ${this.#apiKey}`, ...fetchOptions?.headers },
      });

      const rawText = await response.text();
      let body: RawEnvelope<C> | undefined;
      try {
        body = rawText ? (JSON.parse(rawText) as RawEnvelope<C>) : undefined;
      } catch {
        body = undefined;
      }

      if (!response.ok || !body?.data?.objects) {
        return { success: false, error: errorFromResponse(response, body, rawText) };
      }
      return { success: true, objects: body.data.objects as C[] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  /**
   * Converts an amount from one currency into one or more targets (`amount` defaults to 1, `to` accepts up to 5 codes).
   *
   * @example
   * const { conversions } = await restCountries.convertCurrency({ from: "USD", to: ["EUR", "GBP"], amount: 100 });
   */
  async convertCurrency(
    { from, to, amount }: { from: CurrencyCode; to: CurrencyCode | CurrencyCode[]; amount?: number },
    fetchOptions?: RequestInit,
  ): Promise<CurrencyConvertResult> {
    const targets = Array.isArray(to) ? to : [to];
    const search = new URLSearchParams({ from, to: targets.join(",") });
    if (amount !== undefined) search.set("amount", String(amount));

    const result = await this.#currencyRequest<CurrencyConversion>("/convert", search, fetchOptions);
    if (!result.success) return failure(result.error, "conversions");
    return ok({ conversions: result.objects });
  }

  /**
   * Fetches the full exchange-rate table for a base currency (units per one unit of the base).
   *
   * @example
   * const { rates } = await restCountries.getCurrencyRates({ base: "USD" });
   */
  async getCurrencyRates({ base }: { base: CurrencyCode }, fetchOptions?: RequestInit): Promise<CurrencyRatesResult> {
    const result = await this.#currencyRequest<CurrencyRates>(
      `/rates/${encodeURIComponent(base)}`,
      new URLSearchParams(),
      fetchOptions,
    );
    if (!result.success) return failure(result.error, "base", "as_of", "rates");
    const table = result.objects[0];
    if (!table) return failure(new Error(NOT_FOUND_MESSAGE), "base", "as_of", "rates");
    return ok(table);
  }

  /**
   * Fetches the supported-currency catalog (one `{ code, name, symbol }` per currency, sorted by code).
   *
   * @example
   * const { currencies } = await restCountries.getCurrencies();
   */
  async getCurrencies(fetchOptions?: RequestInit): Promise<CurrenciesResult> {
    const result = await this.#currencyRequest<Currency>("/symbols", new URLSearchParams(), fetchOptions);
    if (!result.success) return failure(result.error, "currencies");
    return ok({ currencies: result.objects });
  }
}
