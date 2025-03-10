import { API_BASE_URL, getCountryByCCA2 } from "../src";

test("fetch specific country by CCA2", async () => {
  const azerbaijan = await getCountryByCCA2({ cca2: "az" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/alpha/az`)).json())[0];
  expect(azerbaijan).toEqual(apiResponse);
});

test("fetch specific fields of country by CCA2", async () => {
  const azerbaijan = await getCountryByCCA2({ cca2: "az", fields: ["car", "capital", "latlng"] });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/alpha/az?fields=car,capital,latlng`)).json())[0];
  expect(azerbaijan).toEqual(apiResponse);
});
