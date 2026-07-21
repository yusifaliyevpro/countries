import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches countries by region", async () => {
  const result = await rc.getCountriesByRegion({ region: "Asia", fields: ["names", "region"], limit: 100 });
  if (!result.success) throw result.error;

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names" | "region">[]>();

  // `region` is a closed union, unlike the LiteralUnion-based params elsewhere —
  // the `as never` in the test below exists precisely because of this.
  expectTypeOf<Country["region"]>().toEqualTypeOf<"Africa" | "Americas" | "Antarctic" | "Asia" | "Europe" | "Oceania">();
  expectTypeOf<Parameters<typeof rc.getCountriesByRegion>[0]["region"]>().toEqualTypeOf<Country["region"]>();

  expect(result.countries.every((c) => c.region === "Asia")).toBe(true);
  expect(result.countries.some((c) => c.names.common === "Japan")).toBe(true);
});

test("returns an empty page for an unknown region", async () => {
  const result = await rc.getCountriesByRegion({ region: "Atlantis" as never, fields: ["names"] });

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names">[] | undefined>();

  // An unknown region must be an empty *successful* page, not an error. The
  // narrowing matters: `result.success ? result.countries : []` would also pass
  // when the request failed outright.
  if (!result.success) throw result.error;
  expect(result.countries).toHaveLength(0);
  expect(result.meta.total).toBe(0);
  expect(result.meta.more).toBe(false);
});
