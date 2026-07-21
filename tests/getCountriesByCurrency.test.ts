import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches countries by currency code", async () => {
  const result = await rc.getCountriesByCurrency({ currency: "EUR", fields: ["names", "currencies"], limit: 100 });
  if (!result.success) throw result.error;

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names" | "currencies">[]>();

  // A country's `currencies` always has a string symbol — unlike the standalone
  // `Currency` type from the catalog, where `symbol` can be null.
  expectTypeOf(result.countries[0].currencies[0].symbol).toEqualTypeOf<string>();

  expect(result.countries.length).toBeGreaterThan(0);
  expect(result.countries.some((c) => c.names.common === "Germany")).toBe(true);
});

test("returns an empty page for an unknown currency", async () => {
  const result = await rc.getCountriesByCurrency({ currency: "ZZZ", fields: ["names"] });

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names">[] | undefined>();

  // Must be an empty *successful* page — the old ternary form also passed when
  // the request itself failed.
  if (!result.success) throw result.error;
  expect(result.countries).toHaveLength(0);
  expect(result.meta.total).toBe(0);
});
