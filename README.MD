# REST Countries Type-Safe Node SDK 🇦🇿 🇨🇦

This package provides an easy and `TYPE-SAFE` way to interact with the [REST Countries API](https://restcountries.com/), which offers detailed information about countries worldwide. You can fetch country data using various parameters like alpha-2/alpha-3/CIOC/CCN3 codes, capital cities, languages, regions, subregions, translations, demonyms and currencies.

> ⚠️ **You are reading the v5 documentation.** v5 is a breaking, ground-up rewrite for REST Countries v5 (which shut down v1–v4). It now **requires an API key** and has a **new schema, class API, and pagination**. Coming from v2.x? Read the **[Migration guide](MIGRATION.md)**.

## Installation

```bash
npm install @yusifaliyevpro/countries
# or
pnpm add @yusifaliyevpro/countries
# or
yarn add @yusifaliyevpro/countries
```

## Getting started

Create a single client with your API key and reuse it everywhere:

```typescript
import { RestCountries } from "@yusifaliyevpro/countries";

const restCountries = new RestCountries({ apiKey: process.env.REST_COUNTRIES_API_KEY! });

// Fetch a single country
const { success, country, error } = await restCountries.getCountryByCode({
  alpha_3: "CAN",
  fields: ["names", "capitals", "flag"],
});
if (!success) throw error; // `error` is an Error here
console.log(country.names.common); // `country` is fully typed — no null checks

// Fetch a paginated list
const result = await restCountries.getCountriesByRegion({
  region: "Europe",
  fields: ["names", "population"],
  limit: 10,
});
if (!result.success) throw result.error;
console.log(result.countries, result.meta);
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

> 📦 **Migrating from v2.x?** The full field-by-field map (old → new) lives in **[MIGRATION.md](MIGRATION.md)**.

## Methods

Every method resolves to a **discriminated result** — never `null`. Destructure all the keys and narrow on `success`; TypeScript then drops `undefined` from the data, so you don't write any null checks:

```typescript
// List endpoints → { success, countries, meta, error }
const { success, countries, meta, error } = await restCountries.getCountriesByLang({
  lang: "Spanish",
  fields: ["names", "languages"],
  limit: 100, // Paid plans have an upper limit of 500, though there are only 254 countries currently.
});
if (!success) throw error; // narrow once…
countries; // …now CountryPicker<T>[]  (not undefined)
meta; // ResponseMeta

// Single endpoints → { success, country, error }
const res = await restCountries.getCountryByCode({ alpha_3: "CAN" });
if (!res.success) throw res.error;
res.country; // CountryPicker<T>
```

On failure (network error, auth failure, or not-found) you get `{ success: false, error: Error, … }` — the method never throws and never returns `null`. List endpoints accept `limit`/`offset` ([Pagination](#pagination)).

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
| [`convertCurrency`](#convertcurrency)                 | list    |
| [`getCurrencyRates`](#getcurrencyrates)               | single  |
| [`getCurrencies`](#getcurrencies)                     | list    |

The last three call the separate [Currencies API](https://restcountries.com/docs) (exchange rates & conversion), not the country dataset.

Additional information:

- [**`Migrating from v2.x`**](MIGRATION.md)
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

Fetches a single country by **one** code, identified by its kind. Pass **exactly one** of `alpha_2`, `alpha_3`, `ccn3`, or `cioc` — passing none or more than one is a compile-time error.

#### Parameters:

- one of `alpha_2` / `alpha_3` / `ccn3` / `cioc`: the code value (autocomplete per type).
- `fields` / `omitFields` (optional): field selection.

#### Example:

```typescript
const { success, country: azerbaijan } = await restCountries.getCountryByCode({ alpha_3: "AZE" });

const { country: switzerland } = await restCountries.getCountryByCode({
  cioc: "SUI", // IOC code (differs from alpha-3 "CHE")
  fields: ["names", "codes", "population"],
});

// @ts-expect-error — can't pass two codes
restCountries.getCountryByCode({ alpha_2: "US", alpha_3: "USA" });
```

---

### `getCountryByCapital`

Fetches a single country by its capital city.

#### Parameters:

- `capital`: Capital city name (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
const { country: germany } = await restCountries.getCountryByCapital({
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
const { country: germany } = await restCountries.getCountryByTranslation({
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
const { country: peru } = await restCountries.getCountryByDemonym({
  demonym: "Peruvian",
  fields: ["cars", "capitals", "codes"],
});
```

---

### `convertCurrency`

Converts an amount from one currency into one or more targets, via the [Currencies API](https://restcountries.com/docs). Both fiat and crypto codes are supported and are case-insensitive. Returns one [`CurrencyConversion`](#available-types) per target under `conversions`.

#### Parameters:

- `from`: Source currency code (e.g. `"USD"`).
- `to`: A single target code, or an array of up to 5 (e.g. `["EUR", "GBP"]`).
- `amount` (optional): Amount to convert. Defaults to `1` (returns the unit rate).

#### Example:

```typescript
const { success, conversions, error } = await restCountries.convertCurrency({
  from: "USD",
  to: ["EUR", "GBP", "CAD"],
  amount: 100,
});
if (!success) throw error;
console.log(conversions[0].result); // 87.72645
```

---

### `getCurrencyRates`

Fetches the full exchange-rate table for a base currency (units per one unit of the base). The single table is flattened onto the result, so you read `base`, `as_of`, and the `rates` map directly.

#### Parameters:

- `base`: Base currency code the table is expressed against (e.g. `"USD"`).

#### Example:

```typescript
const { success, base, rates, error } = await restCountries.getCurrencyRates({ base: "USD" });
if (!success) throw error;
console.log(rates["EUR"]); // 0.8772645
```

---

### `getCurrencies`

Fetches the supported-currency catalog — one [`Currency`](#available-types) (`code`, `name`, `symbol`) per currency, sorted by code. `symbol` is `null` where the currency has no conventional sign (e.g. gold, `"XAU"`). Every code listed here is usable as a `from`, `to`, or `base`.

#### Example:

```typescript
const { success, currencies, error } = await restCountries.getCurrencies();
if (!success) throw error;
console.log(currencies.map((c) => c.code));
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
const result = await restCountries.getCountriesByRegion({
  region: "Africa",
  fields: ["names"],
  limit: 60,
  offset: 0,
});
if (!result.success) throw result.error;

// result.meta: { total, count, limit, offset, more, request_id, duration }
if (result.meta.more) {
  const next = await restCountries.getCountriesByRegion({
    region: "Africa",
    fields: ["names"],
    limit: 60,
    offset: result.meta.offset + result.meta.limit,
  });
}
```

---

## Fetch Options

Every method accepts an optional second argument with any valid `fetch` options (custom headers, caching, timeouts, etc.). The `Authorization` header is added automatically; anything you pass is merged on top.

```typescript
// Next.js caching example
const { country: germany } = await restCountries.getCountryByCode(
  { alpha_3: "DEU", fields: ["names", "capitals"] },
  { next: { revalidate: 7 * 24 * 3600 }, cache: "force-cache" },
);
```

---

## Available Fields

The `fields` parameter selects **top-level** properties of `Country` and gives autocomplete suggestions. Full list:

- `names`: common, official, alternates, native and translations
- `codes`: alpha_2, alpha_3, ccn3, cioc, fifa, fips, gec
- `capitals`: array of `{ name, coordinates, attributes }`
- `flag`: description, emoji, html_entity, unicode, url_png, url_svg, colors (`{ dominant, prominent, palette, swatches }`)
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
const { country } = await restCountries.getCountryByCode({
  alpha_3: "TUR",
  fields: ["names", "capitals", "population"],
});
```

---

## Type Definitions

This package exports TypeScript type definitions. Import them from the main entry or the `/types` subpath:

```typescript
import type { Country, Region, Alpha_2Code } from "@yusifaliyevpro/countries/types";
```

## Available Types

**`Note:` If a long time has passed since the last update, the type data may be outdated.**

- **`Country`**: Comprehensive type for a v5 country object.
- **`CountryListResult`**: Discriminated result of list methods — `{ success: true; countries; meta; error: undefined } | { success: false; countries: undefined; meta: undefined; error: Error }`.
- **`CountryResult`**: Discriminated result of single-country methods (`country` instead of `countries`/`meta`).
- **`ResponseMeta`**: Pagination metadata (`total`, `count`, `limit`, `offset`, `more`, `request_id`, `duration`).
- **`CountryPicker`**: Picks the requested top-level fields from `Country`.
- **`CountryFilters`**: Typed, composable filters for `getCountries` / `search`.
- **`RestCountriesConfig`**: Options for the `RestCountries` constructor.
- **`Alpha_2Code` / `Alpha_3Code` / `Ccn3Code` / `CiocCode`**: Country codes (accept any string ✅).
- **`Capital`**: Capital city names (accept any string ✅).
- **`Region`**: World regions (e.g., "Africa", "Americas").
- **`Subregion`**: World subregions (accept any string ✅).
- **`Lang`**: Language names (accept any string ✅).
- **`CurrencyName`**: A country's currency name/code, for `getCountriesByCurrency` (accept any string ✅).
- **`SupportedLanguages`**: Languages supported for translations.

### Currencies API types

- **`Currency`**: A currency object from the Currencies API — `{ code; name; symbol: string | null }`.
- **`CurrencyCode`**: A currency code for `convertCurrency` / `getCurrencyRates` — autocompletes supported fiat & crypto codes (accepts any string ✅).
- **`CurrencyConversion`**: A single conversion result — `{ from; to; amount; rate; result; as_of }`.
- **`CurrencyRates`**: A base currency's rate table — `{ base; as_of; rates }`.
- **`CurrencyConvertResult`** / **`CurrencyRatesResult`** / **`CurrenciesResult`**: Discriminated results of `convertCurrency` / `getCurrencyRates` / `getCurrencies`.
- **`currencySchema`** / **`currencyConversionSchema`** / **`currencyRatesSchema`**: Zod schemas backing the types above (exported from the main entry for runtime validation).

---

## Response validation

The `Country` type is **inferred from a [Zod Mini](https://zod.dev/packages/mini) schema** (`countrySchema`), which is exported so you can validate responses at runtime if you want:

```typescript
import { countrySchema } from "@yusifaliyevpro/countries";

const res = await restCountries.getCountryByCode({ alpha_3: "CAN" });
if (res.success) {
  const parsed = countrySchema.safeParse(res.country);
  if (!parsed.success) console.error(parsed.error.issues);
}
```

Zod Mini is used to keep the footprint small, and the schema is only pulled into your bundle if you actually import `countrySchema` (the package is marked side-effect-free).

---

## `defineFields`

`defineFields` lets you define a fields array **with autocomplete and type checking** outside of a call site, preserving the literal tuple type so `CountryPicker` can narrow correctly.

```typescript
import { defineFields } from "@yusifaliyevpro/countries";

const countryFields = defineFields(["names", "capitals", "population", "region", "codes", "flag"]);

const { country } = await restCountries.getCountryByCode({ alpha_3: "DEU", fields: countryFields });
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
  const { success, country, error } = await restCountries.getCountryByCode({ alpha_2: "AZ", fields: countryFields });
  if (!success) throw error;
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

Methods **never throw and never return `null`**. Every failure — not-found, network error, or invalid API key — comes back as `{ success: false, error: Error }`. Narrow on `success` to handle it:

```typescript
const res = await restCountries.getCountryByCode({ alpha_3: "XXX", fields: ["names"] });
if (!res.success) {
  console.error(res.error.message); // e.g. "Couldn't find any country…"
} else {
  console.log(res.country.names.common);
}
```

Because the result is a discriminated union, accessing the data before checking `success` is a **compile-time error** — you can't forget to handle failure:

```typescript
const res = await restCountries.getCountryByCode({ alpha_3: "USA", fields: ["names"] });

res.country.names.common;
//  ^^^^^^^ TS error: 'country' is possibly 'undefined' until you check `res.success`
```

Field selection is enforced the same way — accessing a field you didn't request (`fields: ["names"]` then `.capitals`) is a type error.

---

## License

MIT License.
