import { rc } from "./client";

test("fetches a country by capital", async () => {
  const country = await rc.getCountryByCapital({ capital: "Baku", fields: ["names", "capitals"] });
  expect(country?.names.common).toBe("Azerbaijan");
  expect(country?.capitals.some((cap) => cap.name === "Baku")).toBe(true);
});

test("returns null for an unknown capital", async () => {
  const country = await rc.getCountryByCapital({ capital: "ksdsdmkoasl", fields: ["names"] });
  expect(country).toBeNull();
});
