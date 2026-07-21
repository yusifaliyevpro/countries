import type { Country } from "@yusifaliyevpro/countries";
import { ALPHA_2_CODES } from "../src/data/alpha_2";
import { ALPHA_3_CODES } from "../src/data/alpha_3";
import { CAPITALS } from "../src/data/capitals";
import { CCN3_CODES } from "../src/data/ccn3";
import { CIOC_CODES } from "../src/data/cioc";
import { CURRENCIES } from "../src/data/currencies";
import { LANGUAGES } from "../src/data/languages";
import { REGIONS } from "../src/data/regions";
import { SUBREGIONS } from "../src/data/subregions";
import { SUPPORTED_TRANSLATION_KEYS } from "../src/data/translation_keys";
import { loadAllCountries } from "./all-countries";

// The actual values present in the live country data, collected once.
const actual = {
  ALPHA_2_CODES: new Set<string>(),
  ALPHA_3_CODES: new Set<string>(),
  CCN3_CODES: new Set<string>(),
  CIOC_CODES: new Set<string>(),
  CAPITALS: new Set<string>(),
  CURRENCIES: new Set<string>(),
  LANGUAGES: new Set<string>(),
  SUPPORTED_TRANSLATION_KEYS: new Set<string>(),
  REGIONS: new Set<string>(),
  SUBREGIONS: new Set<string>(),
};

const add = (set: Set<string>, value: string | undefined) => {
  if (value) set.add(value);
};

beforeAll(async () => {
  const countries = await loadAllCountries();

  // These constants back the LiteralUnion parameter types, so the data files
  // have to stay readonly tuples of strings — widening one to `string[]` would
  // silently drop autocomplete everywhere without failing a runtime assertion.
  expectTypeOf(countries).toEqualTypeOf<Country[]>();
  expectTypeOf(ALPHA_2_CODES).toExtend<readonly string[]>();
  expectTypeOf(REGIONS).toExtend<readonly Country["region"][]>();
  // Unrecognized territories (Abkhazia, Northern Cyprus, …) return empty strings
  // for missing codes/values, so only collect non-empty ones.
  for (const c of countries) {
    add(actual.ALPHA_2_CODES, c.codes.alpha_2);
    add(actual.ALPHA_3_CODES, c.codes.alpha_3);
    add(actual.CCN3_CODES, c.codes.ccn3);
    add(actual.CIOC_CODES, c.codes.cioc);
    for (const capital of c.capitals) add(actual.CAPITALS, capital.name);
    for (const currency of c.currencies) add(actual.CURRENCIES, currency.name);
    for (const language of c.languages) add(actual.LANGUAGES, language.name);
    // SUPPORTED_TRANSLATION_KEYS are the language codes used as keys of `names.translations`.
    for (const code of Object.keys(c.names.translations)) add(actual.SUPPORTED_TRANSLATION_KEYS, code);
    add(actual.REGIONS, c.region);
    add(actual.SUBREGIONS, c.subregion);
  }
}, 30_000);

const datasets = [
  { label: "ALPHA_2_CODES", file: ALPHA_2_CODES },
  { label: "ALPHA_3_CODES", file: ALPHA_3_CODES },
  { label: "CCN3_CODES", file: CCN3_CODES },
  { label: "CIOC_CODES", file: CIOC_CODES },
  { label: "CAPITALS", file: CAPITALS },
  { label: "CURRENCIES", file: CURRENCIES },
  { label: "LANGUAGES", file: LANGUAGES },
  { label: "SUPPORTED_TRANSLATION_KEYS", file: SUPPORTED_TRANSLATION_KEYS },
  { label: "REGIONS", file: REGIONS },
  { label: "SUBREGIONS", file: SUBREGIONS },
] as const;

// Each `src/data` constant must match the live country data exactly — including
// casing — in both directions: an entry we list that the API doesn't have is
// stale; a value the API has that we didn't list is missing. Either one fails.
test.each(datasets)("$label is in sync with the live country data", ({ label, file }) => {
  const listed = new Set<string>(file);
  const present = actual[label];

  const missing = [...present].filter((value) => !listed.has(value)).toSorted();
  const stale = [...listed].filter((value) => !present.has(value)).toSorted();

  const problems: string[] = [];
  if (missing.length) problems.push(`MISSING from src/data/ (present in API, not listed): ${missing.join(", ")}`);
  if (stale.length) problems.push(`STALE in src/data/ (listed, but absent from API): ${stale.join(", ")}`);
  expect(problems).toEqual([]);
});
