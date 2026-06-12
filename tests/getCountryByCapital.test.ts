import { rc } from "./client";

test("fetches a country by capital", async () => {
  const result = await rc.getCountryByCapital({ capital: "Baku", fields: ["names", "capitals"] });
  if (!result.success) throw result.error;
  expect(result.country.names.common).toBe("Azerbaijan");
  expect(result.country.capitals.some((cap) => cap.name === "Baku")).toBe(true);
});

test("fails for an unknown capital", async () => {
  const result = await rc.getCountryByCapital({ capital: "ksdsdmkoasl", fields: ["names"] });
  expect(result.success).toBe(false);
});
