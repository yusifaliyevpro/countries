import type { Country } from "@yusifaliyevpro/countries";
import { countrySchema } from "@yusifaliyevpro/countries";
import { rc } from "./client";

/** Fetches every country (all properties) by paging through the API. */
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

// `countrySchema` is the single source of truth for the `Country` type, so
// validating EVERY country (with all properties) against it guarantees our
// types match the live v5 API. `strictObject` also fails on any field the API
// returns that we don't model — surfacing schema drift.
test("every country in the API conforms to the Country schema", async () => {
  const countries = await fetchAllCountries();
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
