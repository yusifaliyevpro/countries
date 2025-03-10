import { API_BASE_URL, getCountryByCCA3 } from "../src";

test("fetch specific country by CCA3", async () => {
  const azerbaijan = await getCountryByCCA3({ cca3: "aze" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/alpha/aze`)).json())[0];
  expect(azerbaijan).toEqual(apiResponse);
});

test("fetch specific fields of country by CCA3", async () => {
  const azerbaijan = await getCountryByCCA3({ cca3: "aze", fields: ["car", "capital", "latlng"] });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/alpha/aze?fields=car,capital,latlng`)).json())[0];
  expect(azerbaijan).toEqual(apiResponse);
});
