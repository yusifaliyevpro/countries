import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

// Cached snapshot of every country so tests can run offline. The file is
// gitignored. Delete it to force a fresh refetch from the live API on the next run.
const CACHE_PATH = resolve(__dirname, ".cache/all-countries.json");

/** Fetches every country (all properties) by paging through the live API. */
async function fetchAllCountries(): Promise<Country[]> {
  const all: Country[] = [];
  let offset = 0;
  for (;;) {
    const page = await rc.getCountries({ limit: 300, offset });
    if (!page.success) throw page.error;
    all.push(...page.countries);
    if (!page.meta.more) break;
    offset += page.meta.limit;
  }
  return all;
}

/**
 * Returns every country with all properties, reading from the gitignored cache
 * if present, otherwise fetching from the live API and caching the result.
 */
export async function loadAllCountries(): Promise<Country[]> {
  if (existsSync(CACHE_PATH)) {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Country[];
  }
  const countries = await fetchAllCountries();
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(countries));
  return countries;
}
