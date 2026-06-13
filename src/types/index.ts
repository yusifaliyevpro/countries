import * as z from "zod/mini";
import type { CAPITALS } from "../data/capitals";
import type { ALPHA_2_CODES } from "../data/alpha_2";
import type { ALPHA_3_CODES } from "../data/alpha_3";
import type { CCN3_CODES } from "../data/ccn3";
import type { CIOC_CODES } from "../data/cioc";
import type { CURRENCIES } from "../data/currencies";
import type { LANGUAGES } from "../data/languages";
import type { SUPPORTED_TRANSLATION_KEYS } from "../data/translation_keys";
import { REGIONS } from "../data/regions";
import { SUBREGIONS } from "../data/subregions";
import type { LiteralUnion } from "./common";
import { PrettifyDeep } from "./helpers";

const localizedName = z.strictObject({ common: z.string(), official: z.string() });
const coordinates = z.strictObject({ lat: z.number(), lng: z.number() });
const dayMonth = z.strictObject({ day: z.number(), month: z.number() });

/**
 * The v5 API serialises an **empty** map as `[]` (an empty array) instead of
 * `{}`. So every map-valued field is modelled as `Record<…> | []` to stay
 * faithful to the raw response — guard with `Array.isArray(value)` before use.
 * This will be fixed in future by API maintainers
 */
const emptyMap = z.array(z.never());
const mapOrEmpty = <V extends z.ZodMiniType>(value: V) => z.union([z.record(z.string(), value), emptyMap]);

/**
 * Runtime schema for a country as returned by the REST Countries **v5** API,
 * and the single source of truth for the {@link Country} type (inferred below).
 *
 * It uses {@link https://zod.dev/packages/mini | Zod Mini} for a small footprint
 * and `strictObject` everywhere, so {@link countrySchema}`.parse()` rejects any
 * property the API adds that isn't modelled here — surfacing schema drift.
 */
export const countrySchema = z.strictObject({
  names: z.strictObject({
    common: z.string(),
    official: z.string(),
    alternates: z.array(z.string()),
    native: mapOrEmpty(localizedName),
    translations: mapOrEmpty(localizedName),
  }),
  codes: z.strictObject({
    alpha_2: z.string(),
    alpha_3: z.string(),
    ccn3: z.string(),
    cioc: z.string(),
    fifa: z.string(),
    fips: z.string(),
    gec: z.string(),
  }),
  capitals: z.array(
    z.strictObject({
      name: z.string(),
      coordinates,
      attributes: z.strictObject({
        administrative: z.boolean(),
        constitutional: z.boolean(),
        executive: z.boolean(),
        judicial: z.boolean(),
        legislative: z.boolean(),
        primary: z.boolean(),
      }),
    }),
  ),
  flag: z.strictObject({
    description: z.string(),
    emoji: z.string(),
    html_entity: z.string(),
    unicode: z.string(),
    url_png: z.string(),
    url_svg: z.string(),
  }),
  region: z.literal(REGIONS),
  subregion: z.literal([...SUBREGIONS, ""]),
  area: z.strictObject({ kilometers: z.number(), miles: z.number() }),
  assets: z.array(z.string()),
  borders: z.array(z.string()),
  calling_codes: z.array(z.string()),
  cars: z.strictObject({ driving_side: z.literal(["left", "right"]), signs: z.array(z.string()) }),
  classification: z.strictObject({
    dependency: z.boolean(),
    dependency_type: z.string(),
    disputed: z.boolean(),
    iso_status: z.string(),
    sovereign: z.boolean(),
    un_member: z.boolean(),
    un_observer: z.boolean(),
  }),
  continents: z.array(z.string()),
  coordinates,
  // Usually an array of `{ code, name, symbol }`. A few entities (e.g. Somaliland)
  // still return the old v4 record shape `{ [code]: { name, symbol } }`.
  currencies: z.union([
    z.array(z.strictObject({ code: z.string(), name: z.string(), symbol: z.string() })),
    z.record(z.string(), z.strictObject({ name: z.string(), symbol: z.string() })),
  ]),
  date: z.strictObject({
    academic_year_start: dayMonth,
    fiscal_year_start: z.strictObject({
      corporate: z.strictObject({ basis: z.string(), day: z.number(), month: z.number() }),
      government: dayMonth,
      personal: dayMonth,
    }),
    start_of_week: z.string(),
  }),
  demonyms: mapOrEmpty(z.strictObject({ f: z.string(), m: z.string() })),
  economy: z.strictObject({ gini_coefficient: mapOrEmpty(z.number()) }),
  government_type: z.string(),
  landlocked: z.boolean(),
  languages: z.array(
    z.strictObject({
      bcp47: z.string(),
      iso639_1: z.string(),
      iso639_2b: z.string(),
      iso639_2t: z.string(),
      iso639_3: z.string(),
      name: z.string(),
      native_name: z.string(),
    }),
  ),
  /** Only populated on paid REST Countries plans; otherwise an upgrade notice. */
  leaders: z.array(z.strictObject({ message: z.string(), sample: z.string() })),
  links: z.strictObject({
    google_maps: z.string(),
    official: z.string(),
    open_street_maps: z.string(),
    wikipedia: z.string(),
  }),
  memberships: z.strictObject({
    african_union: z.boolean(),
    arab_league: z.boolean(),
    asean: z.boolean(),
    brics: z.boolean(),
    commonwealth: z.boolean(),
    eu: z.boolean(),
    eurozone: z.boolean(),
    g20: z.boolean(),
    g7: z.boolean(),
    nato: z.boolean(),
    oecd: z.boolean(),
    opec: z.boolean(),
    schengen: z.boolean(),
    un: z.boolean(),
  }),
  number_format: z.strictObject({ decimal_separator: z.string(), thousands_separator: z.string() }),
  parent: z.strictObject({ alpha_2: z.string(), alpha_3: z.string() }),
  population: z.number(),
  postal_code: z.strictObject({ format: z.string(), regex: z.string() }),
  timezones: z.array(z.string()),
  tlds: z.array(z.string()),
  uuid: z.string(),
});

/**
 * A country as returned by the REST Countries **v5** API.
 *
 * Inferred from {@link countrySchema} — edit the schema to change this type.
 *
 * **Note:** v5 restructured the entire schema from v2.x of this package. See [Migration Guide](https://github.com/yusifaliyevpro/countries/blob/main/MIGRATION.md)
 */
export type Country = PrettifyDeep<
  Omit<z.infer<typeof countrySchema>, "subregion"> & {
    /**
     * A known subregion or `""`. Typed as {@link Subregion} (a `LiteralUnion`) so
     * IDEs autocomplete the known values while still accepting any string — e.g.
     * `country.subregion === "New Subregion"` does not error. The runtime schema
     * stays strict (`z.literal`), so a genuinely new subregion is still caught by
     * the conformance test.
     */
    subregion: Subregion;
  }
>;

/**
 * Picks the requested top-level fields from {@link Country}.
 *
 * The REST Countries v5 `response_fields` parameter selects by property path.
 * This library types selection at the top-level key granularity, so passing
 * `["names", "codes"]` yields `Pick<Country, "names" | "codes">`.
 */
export type CountryPicker<T extends readonly (keyof Country)[]> = Pick<Country, T[number]>;

/**
 * Pagination / request metadata returned alongside every list response under
 * the v5 `data.meta` envelope.
 */
export type ResponseMeta = {
  total: number;
  count: number;
  limit: number;
  offset: number;
  more: boolean;
  request_id: string;
  duration: number;
};

/**
 * Discriminated result returned by **list** endpoints. Destructure all four
 * keys and narrow on `success` — TypeScript drops the `undefined`s from
 * `countries`/`meta` once you've checked it:
 *
 * @example
 * const { success, countries, meta, error } = await restCountries.getCountriesByRegion({ region: "Europe" });
 * if (!success) throw error; // `error` is Error here
 * countries; // CountryPicker<T>[]  (no undefined)
 * meta;      // ResponseMeta
 */
export type CountryListResult<T extends readonly (keyof Country)[]> =
  | { success: true; countries: CountryPicker<T>[]; meta: ResponseMeta; error: undefined }
  | { success: false; countries: undefined; meta: undefined; error: Error };

/**
 * Discriminated result returned by **single-country** endpoints (including the
 * not-found case as `success: false`).
 *
 * @example
 * const { success, country, error } = await restCountries.getCountryByCode({ code: "CAN" });
 * if (!success) throw error;
 * country; // CountryPicker<T>  (no undefined)
 */
export type CountryResult<T extends readonly (keyof Country)[]> =
  | { success: true; country: CountryPicker<T>; error: undefined }
  | { success: false; country: undefined; error: Error };

export type SupportedTranslationKey = (typeof SUPPORTED_TRANSLATION_KEYS)[number];
export type Alpha_3Code = LiteralUnion<(typeof ALPHA_3_CODES)[number]>;
export type Alpha_2Code = LiteralUnion<(typeof ALPHA_2_CODES)[number]>;
export type Capital = LiteralUnion<(typeof CAPITALS)[number]>;
export type CiocCode = LiteralUnion<(typeof CIOC_CODES)[number]>;
export type Ccn3Code = LiteralUnion<(typeof CCN3_CODES)[number]>;
export type Region = (typeof REGIONS)[number];
export type Subregion = LiteralUnion<(typeof SUBREGIONS)[number]>;
export type Language = LiteralUnion<(typeof LANGUAGES)[number]>;
export type Currency = LiteralUnion<(typeof CURRENCIES)[number]>;
