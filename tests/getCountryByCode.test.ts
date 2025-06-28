import { getCountryByCode } from "../dist";
import { API_BASE_URL } from "../src/constants";

test("fetch specific country by Code", async () => {
  const country = await getCountryByCode({ code: "aze" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/alpha/aze`)).json())[0];
  expect(country).toEqual(apiResponse);
});

test("fetch specific fields of country by Code", async () => {
  const country = await getCountryByCode({ code: "az", fields: ["car", "capital", "latlng"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/alpha/az?fields=car,capital,latlng`)).json();
  expect(country).toEqual(apiResponse);
});

test("should return null", async () => {
  const country = await getCountryByCode({ code: "aaaabccc", fields: ["car", "capital", "latlng"] });
  expect(country).toEqual(null);
});
