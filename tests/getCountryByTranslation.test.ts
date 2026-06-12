import { rc } from "./client";

test("fetches a country by translated name", async () => {
  const result = await rc.getCountryByTranslation({ translation: "Deutschland", fields: ["names"] });
  if (!result.success) throw result.error;
  expect(result.country.names.common).toBe("Germany");
});

test("fails for an unknown translation", async () => {
  const result = await rc.getCountryByTranslation({ translation: "aaabccc", fields: ["names"] });
  expect(result.success).toBe(false);
});
