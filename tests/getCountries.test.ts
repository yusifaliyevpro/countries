import type { Country, ResponseMeta } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches a page of countries with selected fields", async () => {
  const result = await rc.getCountries({ fields: ["names", "area"], limit: 10 });

  // Before narrowing the payload is optional; the discriminant is what removes it.
  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names" | "area">[] | undefined>();

  if (!result.success) throw result.error;

  // `fields` drives the result type: exactly the selected keys, nothing else.
  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names" | "area">[]>();
  expectTypeOf(result.countries[0]).toHaveProperty("area");
  expectTypeOf(result.countries[0]).not.toHaveProperty("codes");
  expectTypeOf(result.meta).toEqualTypeOf<ResponseMeta>();
  expectTypeOf(result.error).toEqualTypeOf<undefined>();

  expect(result.countries).toHaveLength(10);
  expect(result.meta.limit).toBe(10);
  expect(typeof result.countries[0].names.common).toBe("string");
  expect(typeof result.countries[0].area.kilometers).toBe("number");

  // `fields` is a server-side projection, so assert it at runtime too — the type
  // assertions above prove nothing about what the API actually sent back.
  expect(Object.keys(result.countries[0]).toSorted()).toEqual(["area", "names"]);
  expect(result.meta.total).toBeGreaterThan(200);
  expect(result.meta.more).toBe(true);
});

test("filters by sovereignty via classification", async () => {
  const result = await rc.getCountries({
    filters: { classification: { sovereign: true } },
    fields: ["classification"],
    limit: 5,
  });
  if (!result.success) throw result.error;

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "classification">[]>();
  expectTypeOf(result.countries[0].classification.sovereign).toEqualTypeOf<boolean>();

  expect(result.countries.every((c) => c.classification.sovereign === true)).toBe(true);
});

test("AND-combines composable filters", async () => {
  const result = await rc.getCountries({
    filters: { region: "Europe", landlocked: true, memberships: { eu: true } },
    fields: ["names", "region", "landlocked", "memberships"],
    limit: 100,
  });
  if (!result.success) throw result.error;

  // A four-key selection still narrows exactly, and `region` stays the literal
  // union rather than widening to `string`.
  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "names" | "region" | "landlocked" | "memberships">[]>();
  expectTypeOf(result.countries[0].region).toEqualTypeOf<Country["region"]>();

  expect(result.countries.length).toBeGreaterThan(0);
  expect(result.countries.every((c) => c.region === "Europe" && c.landlocked && c.memberships.eu)).toBe(true);
});

test("filters by continent and membership", async () => {
  const result = await rc.getCountries({
    filters: { continent: "Europe", memberships: { nato: true } },
    fields: ["memberships"],
    limit: 100,
  });
  if (!result.success) throw result.error;

  expectTypeOf(result.countries).toEqualTypeOf<Pick<Country, "memberships">[]>();

  expect(result.countries.every((c) => c.memberships.nato === true)).toBe(true);
});

test("omitFields excludes properties from the response", async () => {
  const result = await rc.getCountries({ omitFields: ["names", "leaders"], limit: 1 });
  if (!result.success) throw result.error;

  // `omitFields` is a runtime-only narrowing — the type stays the full Country,
  // which is why the assertion below has to cast to read the missing keys.
  expectTypeOf(result.countries).toEqualTypeOf<Country[]>();

  const country = result.countries[0] as Record<string, unknown>;
  expect(country.names).toBeUndefined();
  expect(country.leaders).toBeUndefined(); // was omitted too, but never asserted
  // Everything not omitted must still be there — otherwise a response that
  // dropped most fields would pass on the two checks above alone.
  expect(country.codes).toBeDefined();
  expect(country.region).toBeDefined();
  expect(country.population).toBeDefined();
});

test("honours offset for pagination", async () => {
  const first = await rc.getCountries({ fields: ["names"], limit: 1, offset: 0 });
  const second = await rc.getCountries({ fields: ["names"], limit: 1, offset: 1 });
  if (!first.success) throw first.error;
  if (!second.success) throw second.error;

  expectTypeOf(first.countries).toEqualTypeOf<Pick<Country, "names">[]>();
  expectTypeOf(first.meta.offset).toBeNumber();

  expect(first.countries[0].names.common).not.toBe(second.countries[0].names.common);

  // The distinct-name check above passes even if `offset` were ignored and the
  // API just returned arbitrary rows. Pin the pagination contract itself.
  expect(first.meta.offset).toBe(0);
  expect(second.meta.offset).toBe(1);
  expect(second.meta.total).toBe(first.meta.total);
  expect(first.meta.more).toBe(true);
});
