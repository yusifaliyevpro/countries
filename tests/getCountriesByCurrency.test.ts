import { getCountriesByCurrency } from "../dist";
import { API_BASE_URL } from "../src/constants";

test("fetch specific countries by currency", async () => {
  const countries = await getCountriesByCurrency({ currency: "Euro" });
  const apiResponse = await (await fetch(`${API_BASE_URL}/currency/euro`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetch specific fields of countries by currency", async () => {
  const countries = await getCountriesByCurrency({ currency: "Euro", fields: ["car", "capital", "latlng"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/currency/euro?fields=car,capital,latlng`)).json();
  expect(countries).toEqual(apiResponse);
});

test("should return null", async () => {
  const countries = await getCountriesByCurrency({ currency: "kskdskdkk", fields: ["car", "capital", "latlng"] });
  expect(countries).toEqual(null);
});
