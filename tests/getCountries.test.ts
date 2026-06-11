import { rc } from "./client";

test("fetches a page of countries with selected fields", async () => {
  const result = await rc.getCountries({ fields: ["names", "area"], limit: 10 });
  expect(result).not.toBeNull();
  expect(result!.countries).toHaveLength(10);
  expect(result!.meta.limit).toBe(10);
  expect(typeof result!.countries[0].names.common).toBe("string");
  expect(typeof result!.countries[0].area.kilometers).toBe("number");
});

test("filters by sovereignty via classification", async () => {
  const result = await rc.getCountries({
    filters: { classification: { sovereign: true } },
    fields: ["classification"],
    limit: 5,
  });
  expect(result).not.toBeNull();
  expect(result!.countries.every((c) => c.classification.sovereign === true)).toBe(true);
});

test("AND-combines composable filters", async () => {
  const result = await rc.getCountries({
    filters: { region: "Europe", landlocked: true, memberships: { eu: true } },
    fields: ["names", "region", "landlocked", "memberships"],
    limit: 100,
  });
  expect(result).not.toBeNull();
  expect(result!.countries.length).toBeGreaterThan(0);
  expect(result!.countries.every((c) => c.region === "Europe" && c.landlocked && c.memberships.eu)).toBe(true);
});

test("filters by continent and membership", async () => {
  const result = await rc.getCountries({
    filters: { continent: "Europe", memberships: { nato: true } },
    fields: ["memberships"],
    limit: 100,
  });
  expect(result!.countries.every((c) => c.memberships.nato === true)).toBe(true);
});

test("omitFields excludes properties from the response", async () => {
  const result = await rc.getCountries({ omitFields: ["names", "leaders"], limit: 1 });
  expect(result).not.toBeNull();
  const country = result!.countries[0] as Record<string, unknown>;
  expect(country.names).toBeUndefined();
  expect(country.codes).toBeDefined();
});

test("honours offset for pagination", async () => {
  const first = await rc.getCountries({ fields: ["names"], limit: 1, offset: 0 });
  const second = await rc.getCountries({ fields: ["names"], limit: 1, offset: 1 });
  expect(first!.countries[0].names.common).not.toBe(second!.countries[0].names.common);
});
