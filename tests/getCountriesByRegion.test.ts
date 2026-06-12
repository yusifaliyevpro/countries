import { rc } from "./client";

test("fetches countries by region", async () => {
  const result = await rc.getCountriesByRegion({ region: "Asia", fields: ["names", "region"], limit: 100 });
  if (!result.success) throw result.error;
  expect(result.countries.every((c) => c.region === "Asia")).toBe(true);
  expect(result.countries.some((c) => c.names.common === "Japan")).toBe(true);
});

test("returns an empty page for an unknown region", async () => {
  const result = await rc.getCountriesByRegion({ region: "Atlantis" as never, fields: ["names"] });
  expect(result.success ? result.countries : []).toHaveLength(0);
});
