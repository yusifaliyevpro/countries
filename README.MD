# REST Countries Typed API Package 🇦🇿 🇵🇪

This package provides an easy and `TYPE-SAFE` way to interact with the [REST Countries API](https://restcountries.com/), which offers detailed information about countries worldwide. You can fetch country data using various parameters like alpha-2/alpha-3/CIOC/CCN3 codes, capital cities, languages, regions, subregions, translations, demonyms and currencies. `Thanks to Alejandro Matos for this API.`

> ## ⚠️ v5 — Breaking changes (REST Countries v5)
>
> REST Countries shut down v1–v4 and now only serves **v5**, which **requires an API key** and **completely restructured the response schema**. This package's v5 is a ground-up rewrite to match (the major version now tracks the API version):
>
> - **API key is now required.** [Sign up here](https://restcountries.com/sign-up) to get one.
> - **New class-based API.** Instead of importing standalone functions, you create one `RestCountries` instance with your key and call methods on it.
> - **New data shape.** e.g. `name` → `names`, `cca2`/`cca3` → `codes.alpha_2`/`codes.alpha_3`, `capital: string[]` → `capitals: { name, coordinates, attributes }[]`. See [Available Fields](#available-fields).
> - **Pagination.** List methods now return `{ countries, meta }` and accept `limit`/`offset`.
> - **New capabilities.** Free-text [`search()`](#search) and composable [`filters`](#filtering) (memberships, classification, landlocked, continent…).
>
> Migrating from v2.x? See the [field map](#migrating-from-v2x-field-map) for the old→new property translations. If you're not ready to migrate, pin `@yusifaliyevpro/countries@2`.

## Installation

```bash
npm install @yusifaliyevpro/countries
```

## Getting started

Create a single client with your API key and reuse it everywhere:

```typescript
import { RestCountries } from "@yusifaliyevpro/countries";

const restCountries = new RestCountries({ apiKey: process.env.REST_COUNTRIES_API_KEY! });

// Fetch a single country
const canada = await restCountries.getCountryByCode({
  code: "CAN",
  fields: ["names", "capitals", "flag"],
});

// Fetch a paginated list
const { countries, meta } = await restCountries.getCountriesByRegion({
  region: "Europe",
  fields: ["names", "population"],
  limit: 10,
});
```

> **Keep your API key secret.** Load it from an environment variable (e.g. `.env`) — never commit it.

### Client options

```typescript
new RestCountries({
  apiKey: "rc_live_...", // required — sent as `Authorization: Bearer <apiKey>`
  baseURL: "https://...", // optional — override the API base URL
  fetch: customFetch, // optional — custom fetch implementation
});
```

**`Note:`** If you don't set the `fields` parameter, all data will be fetched.

---

## Migrating from v2.x (field map)

v5 restructured the schema. Use this table to translate the `fields` you used to request and the properties you read off each country. Because `fields` selects at **top-level key granularity**, the "Request field" column is what you pass to `fields`; the "Read it as" column is the property path on the returned object.

| v2 field                  | Request field (v5) | Read it as (v5)                           | Notes                                            |
| ------------------------- | ------------------ | ----------------------------------------- | ------------------------------------------------ |
| `name`                    | `names`            | `names.common`, `names.official`          |                                                  |
| `name.nativeName`         | `names`            | `names.native`                            | keyed by language code                           |
| `altSpellings`            | `names`            | `names.alternates`                        |                                                  |
| `translations`            | `names`            | `names.translations`                      |                                                  |
| `cca2`                    | `codes`            | `codes.alpha_2`                           |                                                  |
| `cca3`                    | `codes`            | `codes.alpha_3`                           |                                                  |
| `ccn3`                    | `codes`            | `codes.ccn3`                              |                                                  |
| `cioc`                    | `codes`            | `codes.cioc`                              |                                                  |
| `fifa`                    | `codes`            | `codes.fifa`                              |                                                  |
| `capital`                 | `capitals`         | `capitals[].name`                         | now objects: `{ name, coordinates, attributes }` |
| `capitalInfo.latlng`      | `capitals`         | `capitals[].coordinates`                  | `{ lat, lng }`                                   |
| `latlng`                  | `coordinates`      | `coordinates.lat`, `coordinates.lng`      | tuple → object                                   |
| `region`                  | `region`           | `region`                                  | unchanged                                        |
| `subregion`               | `subregion`        | `subregion`                               | unchanged                                        |
| `continents`              | `continents`       | `continents`                              | unchanged                                        |
| `borders`                 | `borders`          | `borders`                                 | unchanged                                        |
| `landlocked`              | `landlocked`       | `landlocked`                              | unchanged                                        |
| `area`                    | `area`             | `area.kilometers`, `area.miles`           | number → object                                  |
| `population`              | `population`       | `population`                              | unchanged                                        |
| `timezones`               | `timezones`        | `timezones`                               | unchanged                                        |
| `independent`             | `classification`   | `classification.sovereign`                | closest match; see note below                    |
| `unMember`                | `classification`   | `classification.un_member`                |                                                  |
| `status`                  | `classification`   | `classification.iso_status`               | e.g. `"official"`                                |
| `currencies`              | `currencies`       | `currencies[]`                            | `Record` → array of `{ code, name, symbol }`     |
| `languages`               | `languages`        | `languages[].name`                        | `Record` → array of language objects             |
| `demonyms`                | `demonyms`         | `demonyms`                                | shape unchanged (`{ [lang]: { f, m } }`)         |
| `car.side`                | `cars`             | `cars.driving_side`                       | renamed                                          |
| `car.signs`               | `cars`             | `cars.signs`                              |                                                  |
| `tld`                     | `tlds`             | `tlds`                                    | renamed                                          |
| `idd`                     | `calling_codes`    | `calling_codes`                           | `{ root, suffixes }` → `string[]`                |
| `flag` (emoji)            | `flag`             | `flag.emoji`                              | `flag` is now an object                          |
| `flags.png` / `flags.svg` | `flag`             | `flag.url_png`, `flag.url_svg`            |                                                  |
| `flags.alt`               | `flag`             | `flag.description`                        |                                                  |
| `maps.googleMaps`         | `links`            | `links.google_maps`                       |                                                  |
| `maps.openStreetMaps`     | `links`            | `links.open_street_maps`                  |                                                  |
| `gini`                    | `economy`          | `economy.gini_coefficient`                |                                                  |
| `startOfWeek`             | `date`             | `date.start_of_week`                      |                                                  |
| `postalCode`              | `postal_code`      | `postal_code.format`, `postal_code.regex` | renamed                                          |

### ❌ Removed in v5 (no equivalent)

- **`coatOfArms`** — coat-of-arms images are no longer provided by the API.

### 🆕 New in v5

Fields with no v2 counterpart: `memberships` (eu, nato, un, schengen, g7, g20, brics, opec, oecd, …), `classification.dependency` / `disputed` / `un_observer`, `codes.fips` / `gec`, `government_type`, `number_format`, `parent`, `uuid`, `date.academic_year_start` / `fiscal_year_start`, `flag.unicode` / `html_entity`, and `capitals[].attributes`.

> **Note on `independent`:** v5 has no exact `independent` flag. `classification.sovereign` is the closest, but it isn't a 1:1 semantic match — if you relied on the old behaviour, also check `classification.dependency` and `classification.un_member`.

---

## Methods

Methods that return **lists** resolve to `{ countries, meta } | null` and accept `limit`/`offset`.
Methods that return a **single** country resolve to `Country | null`.

| Method                                                | Returns |
| ----------------------------------------------------- | ------- |
| [`getCountries`](#getcountries)                       | list    |
| [`search`](#search)                                   | list    |
| [`getCountriesByName`](#getcountriesbyname)           | list    |
| [`getCountriesByRegion`](#getcountriesbyregion)       | list    |
| [`getCountriesBySubregion`](#getcountriesbysubregion) | list    |
| [`getCountriesByLang`](#getcountriesbylang)           | list    |
| [`getCountriesByCurrency`](#getcountriesbycurrency)   | list    |
| [`getCountryByCode`](#getcountrybycode)               | single  |
| [`getCountryByCapital`](#getcountrybycapital)         | single  |
| [`getCountryByTranslation`](#getcountrybytranslation) | single  |
| [`getCountryByDemonym`](#getcountrybydemonym)         | single  |

Additional information:

- [**`Migrating from v2.x (field map)`**](#migrating-from-v2x-field-map)
- [**`Filtering (CountryFilters)`**](#filtering)
- [**`Pagination`**](#pagination)
- [**`Selecting fields (fields / omitFields)`**](#available-fields)
- [**`defineFields function`**](#definefields)
- [**`CountryPicker Type`**](#countrypickertypeof-fields)
- [**`Response validation (countrySchema)`**](#response-validation)
- [**`Fetch Options`**](#fetch-options)
- [**`Type Definitions && Available Types`**](#type-definitions)
- [**`Available Fields`**](#available-fields)
- [**`Error handling`**](#error-handling)

---

### `getCountries`

Fetches countries, optionally narrowed by composable [`filters`](#filtering) and/or a free-text `q`, with pagination. With no arguments it lists all countries (paginated).

#### Parameters:

- `filters` (optional): Composable property filters, AND-combined. See [Filtering](#filtering).
- `q` (optional): Free-text search across all searchable properties.
- `fields` / `omitFields` (optional): Field selection. See [Available Fields](#available-fields).
- `limit` / `offset` (optional): Pagination (see [Pagination](#pagination)).

#### Example:

```typescript
// All countries, a page at a time
const { countries, meta } = await restCountries.getCountries({
  fields: ["names", "capitals"],
  limit: 50,
});

// Landlocked EU members in Europe (filters are AND-combined)
const { countries } = await restCountries.getCountries({
  filters: { region: "Europe", landlocked: true, memberships: { eu: true } },
  fields: ["names"],
});

// Sovereign UN members
const { countries } = await restCountries.getCountries({
  filters: { classification: { sovereign: true, un_member: true } },
  fields: ["names"],
});
```

---

### `search`

Free-text search across all searchable properties (the v5 `?q=` endpoint). Optionally narrowed by [`filters`](#filtering).

#### Parameters:

- `q`: The search term (first positional argument).
- `filters` (optional): Composable property filters, AND-combined. See [Filtering](#filtering).
- `fields` / `omitFields` (optional): Field selection.
- `limit` / `offset` (optional): Pagination.

#### Example:

```typescript
const { countries } = await restCountries.search("canada", { fields: ["names"] });

// Combine free-text with a filter
const { countries } = await restCountries.search("island", {
  filters: { region: "Oceania" },
  fields: ["names"],
});
```

---

### `getCountriesByName`

Fetches countries matching a name. Searches common, official, alternate and native names. Set `fullText` to require an exact common-name match.

#### Parameters:

- `name`: Search by country name (case-insensitive).
- `fullText` (optional): Require an exact common-name match (default: false).
- `fields` (optional): Array of fields to retrieve.
- `limit` / `offset` (optional): Pagination.

#### Example:

```typescript
// Partial match
const { countries } = await restCountries.getCountriesByName({
  name: "united",
  fields: ["names", "capitals"],
});

// Exact match
const { countries } = await restCountries.getCountriesByName({
  name: "Finland",
  fullText: true,
  fields: ["names"],
});
```

---

### `getCountriesByRegion`

Fetches countries by region name.

#### Parameters:

- `region`: Name of the region (autocomplete).
- `fields` (optional): Array of fields to retrieve.
- `limit` / `offset` (optional): Pagination.

#### Example:

```typescript
const { countries } = await restCountries.getCountriesByRegion({
  region: "Americas",
});
```

---

### `getCountriesBySubregion`

Fetches countries by subregion name.

#### Parameters:

- `subregion`: Name of the subregion (autocomplete).
- `fields` (optional): Array of fields to retrieve.
- `limit` / `offset` (optional): Pagination.

#### Example:

```typescript
const { countries } = await restCountries.getCountriesBySubregion({
  subregion: "Northern Europe",
  fields: ["capitals", "area", "population"],
});
```

---

### `getCountriesByLang`

Fetches countries where the given language is spoken (matches by language name).

#### Parameters:

- `lang`: Language name (autocomplete).
- `fields` (optional): Array of fields to retrieve.
- `limit` / `offset` (optional): Pagination.

#### Example:

```typescript
const { countries } = await restCountries.getCountriesByLang({
  lang: "Spanish",
});
```

---

### `getCountriesByCurrency`

Fetches countries that use the given currency (matches by currency code or name).

#### Parameters:

- `currency`: Currency code (e.g. `"EUR"`) or name (e.g. `"Euro"`) (autocomplete).
- `fields` (optional): Array of fields to retrieve.
- `limit` / `offset` (optional): Pagination.

#### Example:

```typescript
const { countries } = await restCountries.getCountriesByCurrency({
  currency: "EUR",
  fields: ["cars", "capitals", "codes"],
});
```

---

### `getCountryByCode`

Fetches a single country by its code. Detects the code type (alpha-2, alpha-3, CCN3) and falls back to CIOC for three-letter codes.

#### Parameters:

- `code`: An alpha-3, alpha-2, CCN3 or CIOC code (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
const azerbaijan = await restCountries.getCountryByCode({ code: "AZE" });

const switzerland = await restCountries.getCountryByCode({
  code: "SUI", // CIOC code — resolved via fallback
  fields: ["names", "codes", "population"],
});
```

---

### `getCountryByCapital`

Fetches a single country by its capital city.

#### Parameters:

- `capital`: Capital city name (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
const germany = await restCountries.getCountryByCapital({
  capital: "Berlin",
  fields: ["names", "flag", "currencies"],
});
```

---

### `getCountryByTranslation`

Fetches a single country by a translated name.

#### Parameters:

- `translation`: A translated country name (case-insensitive).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
const germany = await restCountries.getCountryByTranslation({
  translation: "Deutschland",
  fields: ["cars", "capitals", "codes"],
});
```

---

### `getCountryByDemonym`

Fetches a single country by its demonym.

#### Parameters:

- `demonym`: A demonym (case-insensitive).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
const peru = await restCountries.getCountryByDemonym({
  demonym: "Peruvian",
  fields: ["cars", "capitals", "codes"],
});
```

---

## Filtering

`getCountries` and `search` accept a typed `filters` object (`CountryFilters`). Every provided filter is **AND-combined**, so you can compose them freely:

```typescript
const { countries } = await restCountries.getCountries({
  filters: {
    region: "Europe", // region name
    subregion: "Western Europe", // subregion name
    continent: "Europe", // matches countries whose `continents` include this
    landlocked: true,
    classification: { sovereign: true, un_member: true, disputed: false },
    memberships: { eu: true, nato: true, schengen: true }, // eu, nato, un, g7, g20, brics, opec, oecd, ...
  },
  fields: ["names"],
});
```

All filter keys are optional and fully typed. `classification` and `memberships` expose every boolean flag from those objects on `Country`.

---

## Pagination

REST Countries v5 paginates results (default 25 per page, max 100). List methods expose `limit` and `offset` and return a `meta` object describing the current page:

```typescript
const { countries, meta } = await restCountries.getCountriesByRegion({
  region: "Africa",
  fields: ["names"],
  limit: 100,
  offset: 0,
});

// meta: { total, count, limit, offset, more, request_id, duration }
if (meta.more) {
  const next = await restCountries.getCountriesByRegion({
    region: "Africa",
    fields: ["names"],
    limit: 100,
    offset: meta.offset + meta.limit,
  });
}
```

---

## Fetch Options

Every method accepts an optional second argument with any valid `fetch` options (custom headers, caching, timeouts, etc.). The `Authorization` header is added automatically; anything you pass is merged on top.

```typescript
// Next.js caching example
const germany = await restCountries.getCountryByCode(
  { code: "DEU", fields: ["names", "capitals"] },
  { next: { revalidate: 7 * 24 * 3600 }, cache: "force-cache" },
);
```

---

## Available Fields

The `fields` parameter selects **top-level** properties of `Country` and gives autocomplete suggestions. Full list:

- `names`: common, official, alternates, native and translations
- `codes`: alpha_2, alpha_3, ccn3, cioc, fifa, fips, gec
- `capitals`: array of `{ name, coordinates, attributes }`
- `flag`: description, emoji, html_entity, unicode, url_png, url_svg
- `region`, `subregion`
- `area`: `{ kilometers, miles }`
- `borders`, `calling_codes`, `continents`, `timezones`, `tlds`, `assets`
- `cars`: `{ driving_side, signs }`
- `classification`: sovereign, un_member, un_observer, dependency, disputed, iso_status
- `coordinates`: `{ lat, lng }`
- `currencies`: array of `{ code, name, symbol }`
- `date`: academic / fiscal year start, start_of_week
- `demonyms`: per-language `{ f, m }`
- `economy`: gini_coefficient
- `government_type`, `landlocked`, `population`
- `languages`: array of language objects
- `leaders`: (paid plans only)
- `links`: official, wikipedia, google_maps, open_street_maps
- `memberships`: un, eu, nato, oecd, g7, g20, brics, opec, schengen, …
- `number_format`: decimal/thousands separators
- `parent`: `{ alpha_2, alpha_3 }`
- `postal_code`: `{ format, regex }`
- `uuid`

> **Note:** `fields` selects at top-level key granularity. Requesting `["names"]` returns the whole `names` object.

### `omitFields` — fetch everything except some fields

Every method also accepts `omitFields` (maps to v5 `response_fields_omit`) to fetch all fields _except_ the listed ones — handy for dropping heavy fields like `names.translations` or `leaders`:

```typescript
// Everything except translations and leaders
const { countries } = await restCountries.getCountries({ omitFields: ["leaders"], limit: 10 });
```

> **Note:** `omitFields` is applied at runtime only; it does not narrow the return type (you still get the full `Country` type). Use `fields` when you want the type narrowed.

```typescript
const country = await restCountries.getCountryByCode({
  code: "TUR",
  fields: ["names", "capitals", "population"],
});
```

---

## Type Definitions

This package exports TypeScript type definitions. Import them from the main entry or the `/types` subpath:

```typescript
import type { Country, Region, Cca2Code } from "@yusifaliyevpro/countries/types";
```

## Available Types

**`Note:` If a long time has passed since the last update, the type data may be outdated.**

- **`Country`**: Comprehensive type for a v5 country object.
- **`CountryList`**: `{ countries: CountryPicker<T>[]; meta: ResponseMeta }` returned by list methods.
- **`ResponseMeta`**: Pagination metadata (`total`, `count`, `limit`, `offset`, `more`, `request_id`, `duration`).
- **`CountryPicker`**: Picks the requested top-level fields from `Country`.
- **`CountryFilters`**: Typed, composable filters for `getCountries` / `search`.
- **`RestCountriesConfig`**: Options for the `RestCountries` constructor.
- **`Cca2Code` / `Cca3Code` / `Ccn3Code` / `CiocCode`**: Country codes (accept any string ✅).
- **`Capital`**: Capital city names (accept any string ✅).
- **`Region`**: World regions (e.g., "Africa", "Americas").
- **`Subregion`**: World subregions (accept any string ✅).
- **`Lang`**: Language names (accept any string ✅).
- **`Currency`**: Currency codes (accept any string ✅).
- **`SupportedLanguages`**: Languages supported for translations.

---

## Response validation

The `Country` type is **inferred from a [Zod Mini](https://zod.dev/packages/mini) schema** (`countrySchema`), which is exported so you can validate responses at runtime if you want:

```typescript
import { countrySchema } from "@yusifaliyevpro/countries";

const country = await restCountries.getCountryByCode({ code: "CAN" });
const result = countrySchema.safeParse(country);
if (!result.success) console.error(result.error.issues);
```

Zod Mini is used to keep the footprint small, and the schema is only pulled into your bundle if you actually import `countrySchema` (the package is marked side-effect-free).

---

## `defineFields`

`defineFields` lets you define a fields array **with autocomplete and type checking** outside of a call site, preserving the literal tuple type so `CountryPicker` can narrow correctly.

```typescript
import { defineFields } from "@yusifaliyevpro/countries";

const countryFields = defineFields(["names", "capitals", "population", "region", "codes", "flag"]);

const country = await restCountries.getCountryByCode({ code: "DEU", fields: countryFields });
```

---

## `CountryPicker<typeof fields>`

`CountryPicker` is a generic type that takes the `fields` array and returns a country type containing only those fields.

### ⚡ Example Full Usage

```tsx
// src/lib/fields.ts
export const countryFields = defineFields(["names", "capitals", "population", "region"]);

// src/app/page.tsx
export default async function CountryPage() {
  const country = await restCountries.getCountryByCode({ code: "AZ", fields: countryFields });
  return (
    <main>
      <CountryCard country={country} />
    </main>
  );
}

// src/components/CountryCard.tsx
export function CountryCard({ country }: { country: CountryPicker<typeof countryFields> }) {
  return <div>{country.names.common}</div>;
}
```

### ✅ Benefits

- **No need for manual type definition** for the returned country.
- **Type-safe fields**: autocomplete and error checking.
- **Reusability**: use the same `fields` and type across your app.
- Prevents accessing fields you didn't fetch.

---

## Error Handling

Errors are handled gracefully and logged to the console. On a not-found, network, or authentication error the method resolves to `null` (single) or an empty page / `null` (lists).

```typescript
const data = await restCountries.getCountryByCode({
  code: "XXX",
  fields: ["names"],
}); // null, with an error logged by the library

const usa = await restCountries.getCountryByCode({
  code: "USA",
  fields: ["names", "population"],
});

// TypeScript Error — 'capitals' was not requested in fields
console.log(usa.capitals);
                ^^^^^^^^
```

---

## License

MIT License.
