import { API_BASE_URL, getCountryByCapital } from "../src";

test("fetch specific country by Capital", async () => {
  const azerbaijan = await getCountryByCapital({ capital: "Baku" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/capital/baku`)).json())[0];
  expect(azerbaijan).toEqual(apiResponse);
});

test("fetch specific fields of country by Capital", async () => {
  const azerbaijan = await getCountryByCapital({ capital: "Baku", fields: ["car", "capital", "latlng"] });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/capital/baku?fields=car,capital,latlng`)).json())[0];
  expect(azerbaijan).toEqual(apiResponse);
});
