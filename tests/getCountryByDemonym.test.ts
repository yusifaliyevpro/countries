import { rc } from "./client";

test("fetches a country by demonym", async () => {
  const country = await rc.getCountryByDemonym({ demonym: "Peruvian", fields: ["names"] });
  expect(country?.names.common).toBe("Peru");
});

test("returns null for an unknown demonym", async () => {
  const country = await rc.getCountryByDemonym({ demonym: "aaabbbcccc", fields: ["names"] });
  expect(country).toBeNull();
});
