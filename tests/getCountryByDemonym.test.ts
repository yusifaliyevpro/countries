import { rc } from "./client";

test("fetches a country by demonym", async () => {
  const result = await rc.getCountryByDemonym({ demonym: "Peruvian", fields: ["names"] });
  if (!result.success) throw result.error;
  expect(result.country.names.common).toBe("Peru");
});

test("fails for an unknown demonym", async () => {
  const result = await rc.getCountryByDemonym({ demonym: "aaabbbcccc", fields: ["names"] });
  expect(result.success).toBe(false);
});
