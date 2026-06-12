import { rc } from "./client";

test("fetches countries by subregion", async () => {
  const result = await rc.getCountriesBySubregion({ subregion: "Northern Europe", fields: ["names", "subregion"], limit: 100 });
  if (!result.success) throw result.error;
  expect(result.countries.every((c) => c.subregion === "Northern Europe")).toBe(true);
});

test("returns an empty page for an unknown subregion", async () => {
  const result = await rc.getCountriesBySubregion({ subregion: "aaaaaaabbb", fields: ["names"] });
  expect(result.success ? result.countries : []).toHaveLength(0);
});
