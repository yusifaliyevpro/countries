import { ALPHA_2_CODES } from "../src/data/alpha_2";
import { ALPHA_3_CODES } from "../src/data/alpha_3";
import { CAPITALS } from "../src/data/capitals";
import { CCN3_CODES } from "../src/data/ccn3";
import { CIOC_CODES } from "../src/data/cioc";
import { CURRENCIES } from "../src/data/currencies";
import { LANGUAGES } from "../src/data/languages";
import { REGIONS } from "../src/data/regions";
import { SUBREGIONS } from "../src/data/subregions";
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
  REGIONS: new Set<string>(),
  SUBREGIONS: new Set<string>(),
};

beforeAll(async () => {
  const countries = await loadAllCountries();
  // Unrecognized territories (Abkhazia, Northern Cyprus, …) return empty strings
  // for missing codes/values, so only collect non-empty ones.
  const add = (set: Set<string>, value: string | undefined) => {
    if (value) set.add(value);
  };
  for (const c of countries) {
    add(actual.ALPHA_2_CODES, c.codes.alpha_2);
    add(actual.ALPHA_3_CODES, c.codes.alpha_3);
    add(actual.CCN3_CODES, c.codes.ccn3);
    add(actual.CIOC_CODES, c.codes.cioc);
    for (const capital of c.capitals) add(actual.CAPITALS, capital.name);
    // currencies is usually an array, but a few entities use the old record shape.
    const currencyList = Array.isArray(c.currencies) ? c.currencies : Object.values(c.currencies);
    for (const currency of currencyList) add(actual.CURRENCIES, currency.name);
    for (const language of c.languages) add(actual.LANGUAGES, language.name);
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
  { label: "REGIONS", file: REGIONS },
  { label: "SUBREGIONS", file: SUBREGIONS },
] as const;

// Each `src/data` constant must match the live country data exactly — including
// casing — in both directions: an entry we list that the API doesn't have is
// stale; a value the API has that we didn't list is missing. Either one fails.
test.each(datasets)("$label is in sync with the live country data", ({ label, file }) => {
  const listed = new Set<string>(file);
  const present = actual[label];

  const missing = [...present].filter((value) => !listed.has(value)).sort();
  const stale = [...listed].filter((value) => !present.has(value)).sort();

  const problems: string[] = [];
  if (missing.length) problems.push(`MISSING from src/data/ (present in API, not listed): ${missing.join(", ")}`);
  if (stale.length) problems.push(`STALE in src/data/ (listed, but absent from API): ${stale.join(", ")}`);
  if (problems.length) throw new Error(`${label} is out of sync:\n${problems.join("\n")}`);
});
