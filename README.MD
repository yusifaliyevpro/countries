# Country Data API Package

This package provides an easy and `TYPE-SAFE` way to interact with the [Rest Countries API](https://restcountries.com/), which offers detailed information about countries worldwide. You can fetch country data using various parameters like CCA2/CCA3 codes, capital cities, and more. `Thank you Alejandro Matos for this API.`

## Installation

```bash
npm install @yusifaliyevpro/countries
```

## Usage

The package exports several utility functions for interacting with the Rest Countries API. All Parameters returns are type-safe. The return type changes if you change `fields` paramater. I suggest to use CCA3 in the functions because it is very precise. For example only 206 out of 250 countries has CIOC code.

---

### `getCountries`

Fetches all countries or filters them based on independence status.

#### Parameters:

- `options` (optional):
  - `fields`: An array of country fields to retrieve (optional).
  - `independent`: Filter by independent countries if `true` (optional - default: both countries).

#### Example:

```typescript
import { getCountries } from "@yusifaliyevpro/countries";

// Fetch all countries and fields
const countries = await getCountries();

// Fetch all countries with specific fields
const independentCountries = await getCountries({
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

Fetches countries by given codes (CCA3, CCA2, CIOC, CCN3).

#### Parameters:

- `codes`: Array of country codes (CCA3, CCA2, CIOC, CCN3).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountriesByCodes } from "@yusifaliyevpro/countries";

const data = await getCountriesByCodes({
  codes: ["US", "AZ", "TR", "DE", "FR"],
  fields: ["name", "capital", "region"],
});
```

---

### `getCountryByCCA3`

Fetches country data by CCA3 code.

#### Parameters:

- `cca3`: The CCA3 country code.
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountryByCCA3 } from "@yusifaliyevpro/countries";

const azerbaijan = await getCountryByCCA3({
  cca3: "AZE",
  fields: ["name", "capital", "population"],
});
```

---

### `getCountryByCCA2`

Fetches country data by CCA2 code.

#### Parameters:

- `cca2`: The CCA2 country code.
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountryByCCA2 } from "@yusifaliyevpro/countries";

const india = await getCountryByCCA2({
  cca2: "IN",
  fields: ["name", "area", "languages"],
});
```

---

### `getCountryByCapital`

Fetches country data by capital city.

#### Parameters:

- `capital`: Capital city name (case-insensitive).
- `fields` (optional): Array of fields to retrieve.

#### Example:

```typescript
import { getCountryByCapital } from "@yusifaliyevpro/countries";

const germany = await getCountryByCapital({
  capital: "Berlin",
  fields: ["name", "flag", "currencies"],
});
```

---

## Available Fields

You can specify which fields to retrieve. Full list of available fields:

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
const country = await getCountryByCCA3({
  cca3: "AZE",
  fields: ["name", "capital", "population"],
});
```

<!-- ---

## Types

### `Cca2Codes`, `Cca3Codes`, `Capitals`, and `Country`

- `Cca2Codes`: ISO 3166-1 alpha-2 two-letter codes.
- `Cca3Codes`: ISO 3166-1 alpha-3 three-letter codes.
- `Capitals`: Capital cities.
- `Country`: Full country object.

#### Example:

```typescript
import { Cca3Codes } from "@yusifaliyevpro/countries";

const code: Cca3Codes = "USA";
```

--- -->

## Error Handling

Errors are handled gracefully and logged to console.

#### Example:

```typescript
const data = await getCountryByCCA3({
  cca3: "XXX",
  fields: ["name"],
}); // data will be null and an error message will be printed

if (!data) {
  console.log("Country not found!");
}
```

---

## License

MIT License.
