import { getCountriesByCurrency } from "../src";
import { API_BASE_URL } from "../src/constants";

test("fetch specific country by currency", async () => {
  const azerbaijan = await getCountriesByCurrency({ currency: "Euro" });
  const apiResponse = await (await fetch(`${API_BASE_URL}/currency/euro`)).json();
  expect(azerbaijan).toEqual(apiResponse);
});

test("fetch specific fields of country by currency", async () => {
  const azerbaijan = await getCountriesByCurrency({ currency: "Euro", fields: ["car", "capital", "latlng"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/currency/euro?fields=car,capital,latlng`)).json();
  expect(azerbaijan).toEqual(apiResponse);
});
