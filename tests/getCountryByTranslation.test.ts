import { rc } from "./client";

test("fetches a country by translated name", async () => {
  const country = await rc.getCountryByTranslation({ translation: "Deutschland", fields: ["names"] });
  expect(country?.names.common).toBe("Germany");
});

test("returns null for an unknown translation", async () => {
  const country = await rc.getCountryByTranslation({ translation: "aaabccc", fields: ["names"] });
  expect(country).toBeNull();
});
