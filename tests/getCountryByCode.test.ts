import type { Country } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches a country by alpha-3 code", async () => {
  const result = await rc.getCountryByCode({ alpha_3: "AZE", fields: ["names", "codes"] });

  expectTypeOf(result.country).toEqualTypeOf<Pick<Country, "names" | "codes"> | undefined>();

  if (!result.success) throw result.error;

  expectTypeOf(result.country).toEqualTypeOf<Pick<Country, "names" | "codes">>();
  expectTypeOf(result.country).not.toHaveProperty("capitals");
  expectTypeOf(result.country.codes.alpha_3).toBeString();
  expectTypeOf(result.error).toEqualTypeOf<undefined>();

  expect(result.country.names.common).toBe("Azerbaijan");
  expect(result.country.codes.alpha_3).toBe("AZE");
});

test("fetches a country by alpha-2 code", async () => {
  const result = await rc.getCountryByCode({ alpha_2: "AZ", fields: ["codes"] });
  if (!result.success) throw result.error;

  expectTypeOf(result.country).toEqualTypeOf<Pick<Country, "codes">>();
  expectTypeOf(result.country).not.toHaveProperty("names");

  expect(result.country.codes.alpha_2).toBe("AZ");
});

test("fetches a country by ccn3 code", async () => {
  const result = await rc.getCountryByCode({ ccn3: "031", fields: ["names"] });
  if (!result.success) throw result.error;

  expectTypeOf(result.country).toEqualTypeOf<Pick<Country, "names">>();

  expect(result.country.names.common).toBe("Azerbaijan");
});

test("fetches a country by cioc code", async () => {
  const result = await rc.getCountryByCode({ cioc: "SUI", fields: ["names"] });
  if (!result.success) throw result.error;

  expectTypeOf(result.country).toEqualTypeOf<Pick<Country, "names">>();

  expect(result.country.names.common).toBe("Switzerland");
});

test("fails for an unknown code", async () => {
  const result = await rc.getCountryByCode({ alpha_3: "ZZZ", fields: ["names"] });
  expect(result).toMatchObject({ success: false, error: expect.any(Error) });

  // The failure branch: an Error, and no country to read. `expectTypeOf` is
  // erased at runtime, so this block asserts types without affecting the test.
  if (!result.success) {
    expectTypeOf(result.error).toEqualTypeOf<Error>();
    expectTypeOf(result.country).toEqualTypeOf<undefined>();
  }
});
