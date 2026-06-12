# Migrating to v5 (REST Countries v5)

REST Countries shut down v1–v4 and now only serves **v5**, which **requires an API key** and **completely restructured the response schema**. This package's `v5` is a ground-up rewrite to match — the major version now tracks the API version.

Because the v1–v4 endpoints are gone, **staying on v2.x of this package is no longer an option** — the old version can't reach a live API. Upgrading is required.

## What changed at a glance

- **API key is now required.** [Sign up here](https://restcountries.com/sign-up) to get one.
- **New class-based API.** Instead of importing standalone functions, you create one `RestCountries` instance with your key and call methods on it.
- **New data shape.** e.g. `name` → `names`, `cca2`/`cca3` → `codes.alpha_2`/`codes.alpha_3`, `capital: string[]` → `capitals: { name, coordinates, attributes }[]`.
- **Pagination.** List methods now return `{ countries, meta }` and accept `limit`/`offset`.
- **New capabilities.** Free-text `search()` and composable `filters` (memberships, classification, landlocked, continent…).

See the [README](README.MD) for the full API reference.

## Return shape: `{ success, … , error }` instead of `null`

In v2.x, methods returned the data or `null`, so you had to null-check before using anything. v5 returns a **discriminated result** — narrow on `success` once and the data is fully typed (no `undefined`), and on failure you get the `Error`:

```ts
// v2.x
const country = await getCountryByCode({ code: "CAN", fields: ["name"] });
if (country === null) return; // had to remember this
country.name.common;

// v5
const { success, country, error } = await restCountries.getCountryByCode({ code: "CAN", fields: ["names"] });
if (!success) throw error; // `error` is an Error
country.names.common; // `country` is narrowed — no null check
```

- **List endpoints** resolve to `{ success: true; countries; meta; error: undefined } | { success: false; countries: undefined; meta: undefined; error: Error }`.
- **Single endpoints** resolve to `{ success: true; country; error: undefined } | { success: false; country: undefined; error: Error }` — **a not-found is `success: false`**, not an empty value.
- Methods **never throw and never return `null`**. Accessing the data before checking `success` is a compile-time error.

## Field map

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
