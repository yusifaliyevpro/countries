import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches countries by subregion", async () => {
  const result = await rc.getCountriesBySubregion({
    subregion: "Northern Europe",
    fields: ["names", "subregion"],
    limit: 100,
  });
  if (!result.success) throw result.error;

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names" | "subregion">[]>();
  expectTypeOf(result.countries[0].subregion).toEqualTypeOf<Country["subregion"]>();

  expect(result.countries.every((c) => c.subregion === "Northern Europe")).toBe(true);
});

test("returns an empty page for an unknown subregion", async () => {
  // No cast needed here, unlike region: `Subregion` is a LiteralUnion, so it
  // suggests the known values while still accepting any string.
  const result = await rc.getCountriesBySubregion({ subregion: "aaaaaaabbb", fields: ["names"] });

  expectTypeOf<Country["subregion"]>().toExtend<string>();
  expectTypeOf("aaaaaaabbb").toExtend<Country["subregion"]>();

  // Must be an empty *successful* page — the old ternary form also passed when
  // the request itself failed.
  if (!result.success) throw result.error;
  expect(result.countries).toHaveLength(0);
  expect(result.meta.total).toBe(0);
});
