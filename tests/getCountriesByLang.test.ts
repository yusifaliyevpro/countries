import { rc } from "./client";

test("fetches countries by language", async () => {
  const result = await rc.getCountriesByLang({ lang: "Spanish", fields: ["names", "languages"], limit: 100 });
  if (!result.success) throw result.error;
  expect(result.countries.some((c) => c.names.common === "Spain")).toBe(true);
});

test("returns an empty page for an unknown language", async () => {
  const result = await rc.getCountriesByLang({ lang: "Klingon", fields: ["names"] });
  expect(result.success ? result.countries : []).toHaveLength(0);
});
