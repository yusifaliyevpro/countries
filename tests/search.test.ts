import { rc } from "./client";

test("free-text search finds a country", async () => {
  const result = await rc.search("canada", { fields: ["names"] });
  expect(result).not.toBeNull();
  expect(result!.countries.some((c) => c.names.common === "Canada")).toBe(true);
});

test("free-text search combined with a filter", async () => {
  const result = await rc.search("island", { filters: { region: "Oceania" }, fields: ["names", "region"], limit: 100 });
  expect(result).not.toBeNull();
  expect(result!.countries.length).toBeGreaterThan(0);
  expect(result!.countries.every((c) => c.region === "Oceania")).toBe(true);
});
