import { rc } from "./client";

test("fetches countries by partial name", async () => {
  const result = await rc.getCountriesByName({ name: "united", fields: ["names"], limit: 100 });
  if (!result.success) throw result.error;
  expect(result.countries.some((c) => c.names.common === "United Arab Emirates")).toBe(true);
});

test("fetches a country by full-text name match", async () => {
  const result = await rc.getCountriesByName({ name: "Finland", fullText: true, fields: ["names"] });
  if (!result.success) throw result.error;
  expect(result.countries).toHaveLength(1);
  expect(result.countries[0].names.common).toBe("Finland");
});

test("returns an empty page for an unknown name", async () => {
  const result = await rc.getCountriesByName({ name: "akskaks", fields: ["names"] });
  expect(result.success ? result.countries : []).toHaveLength(0);
});
