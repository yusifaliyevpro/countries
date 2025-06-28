import { getCountriesByLang } from "../dist";
import { API_BASE_URL } from "../src/constants";

test("fetch specific countries by lang", async () => {
  const countries = await getCountriesByLang({ lang: "Spanish" });
  const apiResponse = await (await fetch(`${API_BASE_URL}/lang/spanish`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetch specific fields of countries by lang", async () => {
  const countries = await getCountriesByLang({ lang: "Turkish", fields: ["car", "capital", "latlng"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/lang/turkish?fields=car,capital,latlng`)).json();
  expect(countries).toEqual(apiResponse);
});

test("should return null", async () => {
  const countries = await getCountriesByLang({ lang: "aaabbbcc", fields: ["car", "capital", "latlng"] });
  expect(countries).toEqual(null);
});
