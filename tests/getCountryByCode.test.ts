import { rc } from "./client";

test("fetches a country by alpha-3 code", async () => {
  const country = await rc.getCountryByCode({ code: "AZE", fields: ["names", "codes"] });
  expect(country?.names.common).toBe("Azerbaijan");
  expect(country?.codes.alpha_3).toBe("AZE");
});

test("fetches a country by alpha-2 code", async () => {
  const country = await rc.getCountryByCode({ code: "AZ", fields: ["codes"] });
  expect(country?.codes.alpha_2).toBe("AZ");
});

test("resolves a CIOC code via fallback", async () => {
  const country = await rc.getCountryByCode({ code: "SUI", fields: ["names", "codes"] });
  expect(country?.names.common).toBe("Switzerland");
});

test("returns null for an unknown code", async () => {
  const country = await rc.getCountryByCode({ code: "ZZZ", fields: ["names"] });
  expect(country).toBeNull();
});
