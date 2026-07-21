import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches countries by partial name", async () => {
  const result = await rc.getCountriesByName({ name: "united", fields: ["names"], limit: 100 });
  if (!result.success) throw result.error;

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names">[]>();
  expectTypeOf(result.countries[0].names.translations).toEqualTypeOf<Country["names"]["translations"]>();

  expect(result.countries.some((c) => c.names.common === "United Arab Emirates")).toBe(true);
});

test("fetches a country by full-text name match", async () => {
  const result = await rc.getCountriesByName({ name: "Finland", fullText: true, fields: ["names"] });
  if (!result.success) throw result.error;

  // `fullText` changes the query, not the shape: still a list, never a single country.
  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names">[]>();
  expectTypeOf<Parameters<typeof rc.getCountriesByName>[0]["fullText"]>().toEqualTypeOf<boolean | undefined>();

  expect(result.countries).toHaveLength(1);
  expect(result.countries[0].names.common).toBe("Finland");
});

test("returns an empty page for an unknown name", async () => {
  const result = await rc.getCountriesByName({ name: "akskaks", fields: ["names"] });

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names">[] | undefined>();

  // Must be an empty *successful* page — the old ternary form also passed when
  // the request itself failed.
  if (!result.success) throw result.error;
  expect(result.countries).toHaveLength(0);
  expect(result.meta.total).toBe(0);
});
