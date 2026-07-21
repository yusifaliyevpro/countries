import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches countries by language", async () => {
  const result = await rc.getCountriesByLang({ lang: "Spanish", fields: ["names", "languages"], limit: 100 });
  if (!result.success) throw result.error;

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names" | "languages">[]>();
  expectTypeOf(result.countries[0].languages).toEqualTypeOf<Country["languages"]>();
  expectTypeOf(result.countries[0].languages[0].iso639_3).toBeString();

  expect(result.countries.some((c) => c.names.common === "Spain")).toBe(true);
});

test("returns an empty page for an unknown language", async () => {
  const result = await rc.getCountriesByLang({ lang: "Klingon", fields: ["names"] });

  // An unknown language is a valid argument, not a type error — `lang` is a
  // LiteralUnion, so unrecognised values still type-check.
  expectTypeOf("Klingon").toExtend<Parameters<typeof rc.getCountriesByLang>[0]["lang"]>();
  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names">[] | undefined>();

  // Must be an empty *successful* page — the old ternary form also passed when
  // the request itself failed.
  if (!result.success) throw result.error;
  expect(result.countries).toHaveLength(0);
  expect(result.meta.total).toBe(0);
});
