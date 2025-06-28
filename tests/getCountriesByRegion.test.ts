import { getCountriesByRegion } from "../dist";
import { API_BASE_URL } from "../src/constants";

test("fetchs specific countries by Region correctly", async () => {
  const countries = await getCountriesByRegion({ region: "Asia" });
  const apiResponse = await (await fetch(`${API_BASE_URL}/region/Asia`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetchs specific countries with specific fields bu Region correctly", async () => {
  const countries = await getCountriesByRegion({ region: "Americas", fields: ["startOfWeek", "area"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/region/Americas?fields=area,startOfWeek`)).json();
  expect(countries).toEqual(apiResponse);
});
