import { getCountryByCapital } from "../dist";
import { API_BASE_URL } from "../src/constants";

test("fetch specific country by Capital", async () => {
  const country = await getCountryByCapital({ capital: "Baku" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/capital/baku`)).json())[0];
  expect(country).toEqual(apiResponse);
});

test("fetch specific fields of country by Capital", async () => {
  const country = await getCountryByCapital({ capital: "Baku", fields: ["car", "capital", "latlng"] });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/capital/baku?fields=car,capital,latlng`)).json())[0];
  expect(country).toEqual(apiResponse);
});

test("should return null", async () => {
  const country = await getCountryByCapital({ capital: "ksdsdmkoasl", fields: ["car", "capital", "latlng"] });
  expect(country).toEqual(null);
});
