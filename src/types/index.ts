import * as z from "zod/mini";
import type { ALPHA_2_CODES } from "../data/alpha_2";
import type { ALPHA_3_CODES } from "../data/alpha_3";
import type { CAPITALS } from "../data/capitals";
import type { CCN3_CODES } from "../data/ccn3";
import type { CIOC_CODES } from "../data/cioc";
import type { CURRENCIES } from "../data/currencies";
import type { CURRENCY_CODES } from "../data/currency_codes";
import type { LANGUAGES } from "../data/languages";
import { REGIONS } from "../data/regions";
import { SUBREGIONS } from "../data/subregions";
import type { SUPPORTED_TRANSLATION_KEYS } from "../data/translation_keys";
import type { LiteralUnion } from "./common";
import type { PrettifyDeep } from "./helpers";

const localizedName = z.strictObject({ common: z.string(), official: z.string() });
type LocalizedName = z.infer<typeof localizedName>;
const coordinates = z.strictObject({ lat: z.number(), lng: z.number() });
const dayMonth = z.strictObject({ day: z.number(), month: z.number() });

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
    native: z.record(z.string(), localizedName),
    translations: z.record(z.string(), localizedName),
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
    colors: z.strictObject({
      /** Dominant flag color as a hex string. `""` for countries without a flag. */
      dominant: z.string(),
      /** Most prominent flag color (largest share of the flag's area) as a hex string. */
      prominent: z.string(),
      /** Palette of `{ hex, proportion }`, pairing each color with its 0–1 area share. `[]` for countries without a flag. */
      palette: z.array(z.strictObject({ hex: z.string(), proportion: z.number() })),
      /** Semantic color swatches by role; all six are always present, `null` when the flag has no matching color. */
      swatches: z.strictObject({
        vibrant: z.union([z.string(), z.null()]),
        muted: z.union([z.string(), z.null()]),
        dark_vibrant: z.union([z.string(), z.null()]),
        dark_muted: z.union([z.string(), z.null()]),
        light_vibrant: z.union([z.string(), z.null()]),
        light_muted: z.union([z.string(), z.null()]),
      }),
    }),
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
  currencies: z.array(z.strictObject({ code: z.string(), name: z.string(), symbol: z.string() })),
  date: z.strictObject({
    academic_year_start: dayMonth,
    fiscal_year_start: z.strictObject({
      corporate: z.strictObject({ basis: z.string(), day: z.number(), month: z.number() }),
      government: dayMonth,
      personal: dayMonth,
    }),
    start_of_week: z.string(),
  }),
  demonyms: z.record(z.string(), z.strictObject({ f: z.string(), m: z.string() })),
  economy: z.strictObject({ gini_coefficient: z.record(z.string(), z.number()) }),
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
  leaders: z.union([
    z.array(z.strictObject({ message: z.string(), sample: z.string() })),
    z.array(
      z.strictObject({
        uuid: z.union([z.string(), z.null()]),
        name: z.string(),
        title: z.string(),
        links: z.strictObject({ wikipedia: z.union([z.string(), z.null()]) }),
        attributes: z.strictObject({
          administers_executive: z.union([z.boolean(), z.null()]),
          de_facto_executive: z.union([z.boolean(), z.null()]),
          head_of_government: z.union([z.boolean(), z.null()]),
          head_of_state: z.union([z.boolean(), z.null()]),
          is_representative: z.union([z.boolean(), z.null()]),
          pending_office: z.union([z.boolean(), z.null()]),
          provisional: z.union([z.boolean(), z.null()]),
        }),
        // `assets` is `{}` when the leader has no assets, otherwise a single
        // `wikipedia.article.open_graph_image` entry — so the key is optional.
        assets: z.strictObject({
          "wikipedia.article.open_graph_image": z.optional(
            z.strictObject({
              renditions: z.array(
                z.strictObject({
                  content_hash: z.string(),
                  content_type: z.string(),
                  filesize: z.number(),
                  height: z.number(),
                  max_edge: z.number(),
                  url: z.string(),
                  width: z.number(),
                }),
              ),
              source: z.string(),
              type: z.string(),
            }),
          ),
        }),
      }),
    ),
  ]),
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
  units: z.strictObject({
    measurement_system: z.literal(["metric", "imperial"]),
    temperature_scale: z.literal(["Celsius", "Fahrenheit"]),
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
  Omit<z.infer<typeof countrySchema>, "subregion" | "names"> & {
    /**
     * A known subregion or `""`. Typed as {@link Subregion} (a `LiteralUnion`) so
     * IDEs autocomplete the known values while still accepting any string — e.g.
     * `country.subregion === "New Subregion"` does not error. The runtime schema
     * stays strict (`z.literal`), so a genuinely new subregion is still caught by
     * the conformance test.
     */
    subregion: Subregion;
    names: Omit<z.infer<typeof countrySchema>["names"], "translations"> & {
      /**
       * Translation keys autocomplete to the known {@link SupportedTranslationKey}
       * codes while still accepting any string (`LiteralUnion`), so
       * `names.translations["tur"]` is suggested in the IDE — and new languages the
       * API may add later still type-check. The runtime schema stays a loose record.
       */
      translations: Partial<Record<LiteralUnion<SupportedTranslationKey>, LocalizedName>>;
    };
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
export type CurrencyName = LiteralUnion<(typeof CURRENCIES)[number]>;
export type CurrencyCode = LiteralUnion<(typeof CURRENCY_CODES)[number]>;

export {
  currencySchema,
  currencyConversionSchema,
  currencyRatesSchema,
  type Currency,
  type CurrencyConversion,
  type CurrencyRates,
  type CurrencyConvertResult,
  type CurrencyRatesResult,
  type CurrenciesResult,
} from "./currencies";
