import { getCountryByCode } from "../src";
import { API_BASE_URL } from "../src/constants";

test("fetch specific country by Code", async () => {
  const azerbaijan = await getCountryByCode({ code: "aze" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/alpha/aze`)).json())[0];
  expect(azerbaijan).toEqual(apiResponse);
});

test("fetch specific fields of country by Code", async () => {
  const azerbaijan = await getCountryByCode({ code: "az", fields: ["car", "capital", "latlng"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/alpha/az?fields=car,capital,latlng`)).json();
  expect(azerbaijan).toEqual(apiResponse);
});
