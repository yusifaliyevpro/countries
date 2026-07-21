import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("free-text search finds a country", async () => {
  const result = await rc.search("canada", { fields: ["names"] });
  if (!result.success) throw result.error;

  // `search` takes the query positionally, but still infers `fields` from the
  // options object exactly like the keyed endpoints.
  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names">[]>();
  expectTypeOf(result.countries[0]).not.toHaveProperty("region");

  expect(result.countries.some((c) => c.names.common === "Canada")).toBe(true);
});

test("free-text search combined with a filter", async () => {
  const result = await rc.search("island", { filters: { region: "Oceania" }, fields: ["names", "region"], limit: 100 });
  if (!result.success) throw result.error;

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names" | "region">[]>();
  expectTypeOf(result.countries[0].region).toEqualTypeOf<Country["region"]>();

  expect(result.countries.length).toBeGreaterThan(0);
  expect(result.countries.every((c) => c.region === "Oceania")).toBe(true);
});
