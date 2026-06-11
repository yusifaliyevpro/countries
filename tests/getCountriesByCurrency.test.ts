import { rc } from "./client";

test("fetches countries by currency code", async () => {
  const result = await rc.getCountriesByCurrency({ currency: "EUR", fields: ["names", "currencies"], limit: 100 });
  expect(result).not.toBeNull();
  expect(result!.countries.length).toBeGreaterThan(0);
  expect(result!.countries.some((c) => c.names.common === "Germany")).toBe(true);
});

test("returns an empty page for an unknown currency", async () => {
  const result = await rc.getCountriesByCurrency({ currency: "ZZZ", fields: ["names"] });
  expect(result?.countries ?? []).toHaveLength(0);
});
