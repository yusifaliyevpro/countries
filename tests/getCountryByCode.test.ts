import { rc } from "./client";

test("fetches a country by alpha-3 code", async () => {
  const result = await rc.getCountryByCode({ alpha_3: "AZE", fields: ["names", "codes"] });
  if (!result.success) throw result.error;
  expect(result.country.names.common).toBe("Azerbaijan");
  expect(result.country.codes.alpha_3).toBe("AZE");
});

test("fetches a country by alpha-2 code", async () => {
  const result = await rc.getCountryByCode({ alpha_2: "AZ", fields: ["codes"] });
  if (!result.success) throw result.error;
  expect(result.country.codes.alpha_2).toBe("AZ");
});

test("fetches a country by ccn3 code", async () => {
  const result = await rc.getCountryByCode({ ccn3: "031", fields: ["names"] });
  if (!result.success) throw result.error;
  expect(result.country.names.common).toBe("Azerbaijan");
});

test("fetches a country by cioc code", async () => {
  const result = await rc.getCountryByCode({ cioc: "SUI", fields: ["names"] });
  if (!result.success) throw result.error;
  expect(result.country.names.common).toBe("Switzerland");
});

test("fails for an unknown code", async () => {
  const result = await rc.getCountryByCode({ alpha_3: "ZZZ", fields: ["names"] });
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error).toBeInstanceOf(Error);
});
