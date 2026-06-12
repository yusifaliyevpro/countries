import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Country } from "@yusifaliyevpro/countries";
import { countrySchema } from "@yusifaliyevpro/countries";
import { rc } from "./client";

// Cached snapshot of every country so this test can run offline. The file is
// gitignored. Delete it to force a fresh refetch from the live API on the next run.
const CACHE_PATH = resolve(__dirname, ".cache/all-countries.json");

/** Fetches every country (all properties) by paging through the live API. */
async function fetchAllCountries(): Promise<Country[]> {
  const all: Country[] = [];
  let offset = 0;
  for (;;) {
    const page = await rc.getCountries({ limit: 100, offset });
    if (!page) throw new Error(`Failed to fetch countries at offset ${offset}`);
    all.push(...page.countries);
    if (!page.meta.more) break;
    offset += page.meta.limit;
  }
  return all;
}

/** Returns the cached countries if present, otherwise fetches, caches, and returns them. */
async function loadAllCountries(): Promise<Country[]> {
  if (existsSync(CACHE_PATH)) {
    console.log("Loading countries from cache...");
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Country[];
  }
  console.log("Fetching countries from API...");
  const countries = await fetchAllCountries();
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(countries));
  return countries;
}

// `countrySchema` is the single source of truth for the `Country` type, so
// validating EVERY country (with all properties) against it guarantees our
// types match the live v5 API. `strictObject` also fails on any field the API
// returns that we don't model — surfacing schema drift.
test("every country in the API conforms to the Country schema", async () => {
  const countries = await loadAllCountries();
  expect(countries.length).toBeGreaterThan(200);

  const failures: string[] = [];
  for (const country of countries) {
    const result = countrySchema.safeParse(country);
    if (!result.success) {
      const name = country.names?.common ?? country.codes?.alpha_3 ?? "unknown";
      const details = result.error.issues
        .map((issue: { path: PropertyKey[]; message: string }) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; ");
      failures.push(`${name}: ${details}`);
    }
  }

  if (failures.length) {
    throw new Error(`${failures.length}/${countries.length} countries failed schema validation:\n${failures.join("\n")}`);
  }
}, 30_000);
