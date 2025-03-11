# REST Countries Typed API Package

This package provides an easy and `TYPE-SAFE` way to interact with the [Rest Countries API](https://restcountries.com/), which offers detailed information about countries worldwide. You can fetch country data using various parameters like CCA2/CCA3/CIOC/CCN3 codes, capital cities, languages, regions, subregions, translations, demonyms, currencies. `Thanks to Alejandro Matos for this API.`

## Installation

```bash
npm install @yusifaliyevpro/countries
```

## Usage

The package exports several utility functions for interacting with the Rest Countries API. All Parameter returns are type-safe. The return type changes if you change `fields` paramater. I suggest to use CCA3 in the functions because it is very precise. For example only 206 out of 250 countries have CIOC code.

**`Note:`** If you don't set the fields parameter, all data will be fetched.

The List of functions:

- [**`getCountries`**](#getCountries)
- [**`getCountriesByCodes`**](#getCountriesByCodes)
- [**`getCountriesByRegion`**](#getCountriesByRegion)
- [**`getCountriesBySubregion`**](#getCountriesBySubregion)
- [**`getCountriesByLang`**](#getCountriesByLang)
- [**`getCountriesByCurrency`**](#getCountriesByCurrency)
- [**`getCountryByCode`**](#getCountryByCode)
- [**`getCountryByCapital`**](#getCountryByCapital)
- [**`getCountryByTranslation`**](#getcountrybytranslation)
- [**`getCountryByDemonym`**](#getcountrybydemonym)

Additional information:

- **`Type Definitions`** **(coming soon)**
- [**`Available Fields`**](#available-fields)
- [**`Error handling`**](#error-handling)

---

### `getCountries`

Fetches all countries or filters them based on independence status.
`Note:` Some countries do not have an `independent` value (due to political reasons), so they won't be fetched if you set the independent parameter.

#### Parameters:

- `fields`: An array of country fields to retrieve (optional).
- `independent`: Filter by independent countries if `true` (optional - default: all countries).

#### Example:

```typescript
import { getCountries } from "@yusifaliyevpro/countries";

// Fetch all countries and fields
const countries = await getCountries();

// Fetch all countries with specific fields
const countries = await getCountries({
  fields: ["name", "capital"],
});

// Fetch independent countries with specific fields
const independentCountries = await getCountries({
  independent: true,
  fields: ["name", "capital"],
});
```

---

### `getCountriesByCodes`

Fetches countries by given codes.

#### Parameters:

- `codes`: Array of country CCA3, CCA2, CCN3, CIOC codes (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountriesByCodes } from "@yusifaliyevpro/countries";

// Fetch selected countries with specific fields
const data = await getCountriesByCodes({
  codes: ["USA", "AZ", "268", "TR", "170", "FR", "EST"],
  fields: ["name", "capital", "region"],
});
```

---

### `getCountriesByRegion`

Fetches countries by region name.

#### Parameters:

- `region`: Name of region you want to fetch (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountriesByRegion } from "@yusifaliyevpro/countries";

// Fetch Countries which are located in America
const data = await getCountriesByRegion({
  region: "Americas",
});
```

---

### `getCountriesBySubregion`

Fetches countries by subregion name.

#### Parameters:

- `subregion`: Name of subregion you want to fetch (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountriesBySubregion } from "@yusifaliyevpro/countries";

// Fetch all countries which locates in Central Europe
// with specific fields
const data = await getCountriesBySubregion({
  subregion: "Central Europe",
  fields: ["capital", "area", "population"],
});
```

---

### `getCountriesByLang`

Fetches countries by language.

#### Parameters:

- `lang`: Language of countries you want to fetch (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountriesByLang } from "@yusifaliyevpro/countries";

// Fetch countries which speaks Spanish with all fields
const data = await getCountriesByLang({
  lang: "Spanish",
});
```

---

### `getCountriesByCurrency`

Fetches countries by currency.

#### Parameters:

- `currency`: Currency of countries you want to fetch (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountriesByCurrency } from "@yusifaliyevpro/countries";

// Fetch countries which use Euro with specific fields
const data = await getCountriesByCurrency({
  currency: "Euro",
  fields: ["car", "capital", "fifa", "cca3"],
});
```

---

### `getCountryByCode`

Fetches country data by code.

#### Parameters:

- `code`: The country `CCA3`, CCA2, CCN3 or CIOC code (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountryByCode } from "@yusifaliyevpro/countries";

// Fetch Azerbaijan with all fields
const azerbaijan = await getCountryByCode({
  code: "AZE",
});

// Fetch Germany with specific fields
const germany = await getCountryByCode({
  code: "GER",
  fields: ["name", "cca2", "population"],
});
```

---

### `getCountryByTranslation`

Fetches a country by its translation.

#### Parameters:

- `translation`: Translation of the name of country you want to fetch (case-insensitive).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountryByTranslation } from "@yusifaliyevpro/countries";

// Fetch country which has translation "alemania" with specific fields
const germany = await getCountryByTranslation({
  translation: "alemania",
  fields: ["car", "capital", "fifa", "cca3"],
});
```

---

### `getCountryByDemonym`

Fetches a country by its demonym.

#### Parameters:

- `demonym`: Demonym of the citizenship of country you want to fetch (case-insensitive).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountryByDemonym } from "@yusifaliyevpro/countries";

// Fetch the country whose citizens are called "Peruvian" with specific fields
const peru = await getCountryByDemonym({
  demonym: "peruvian",
  fields: ["car", "capital", "fifa", "cca3"],
});
```

---

### `getCountryByCapital`

Fetches country data based on the capital city.

#### Parameters:

- `capital`: Capital city name (case-insensitive) (autocomplete).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountryByCapital } from "@yusifaliyevpro/countries";

// Fetch Germany with specific fields
const germany = await getCountryByCapital({
  capital: "Berlin",
  fields: ["name", "flag", "currencies"],
});
```

---

## Available Fields

You can specify which fields to retrieve. The fields parameter will give autocomplete suggestions. Full list of available fields:

- `name`: Object with common, official, and native names
- `tld`: Top-level domain
- `cca2`, `ccn3`, `cca3`, `cioc`: Country codes
- `independent`: Boolean flag
- `status`: Status of the country
- `unMember`: UN membership status
- `currencies`: Currency information
- `idd`: International dialing info
- `capital`: Capital city
- `altSpellings`: Alternative spellings
- `region`, `subregion`: Region info
- `languages`: Languages spoken
- `translations`: Translations of country name
- `latlng`: Latitude and longitude
- `landlocked`: Boolean flag
- `borders`: Bordering countries
- `area`: Area in square kilometers
- `demonyms`: Demonyms
- `flag`: Emoji flag
- `maps`: Google and OpenStreetMap links
- `population`: Population count
- `gini`: GINI coefficient
- `fifa`: FIFA code
- `car`: Car signs and driving side
- `timezones`: List of timezones
- `continents`: List of continents
- `flags`: Object with PNG and SVG flag URLs
- `coatOfArms`: Coat of arms images
- `startOfWeek`: Start of the week
- `capitalInfo`: Capital coordinates
- `postalCode`: Postal code format

#### Example with fields:

```typescript
const country = await getCountryByCode({
  code: "TUR",
  fields: ["name", "capital", "population"],
});
```

## Error Handling

Errors are handled gracefully, type-safe, and logged to the console.

#### Example:

```typescript
const data = await getCountryByCode({
  code: "XXX",
  fields: ["name"],
}); // data will be null and an error message will be printed (by library)
```

---

## License

MIT License.
