import { getCountriesBySubregion } from "../dist";
import { API_BASE_URL } from "../src/constants";

test("fetchs specific countries by Subregion correctly", async () => {
  const countries = await getCountriesBySubregion({ subregion: "Australia and New Zealand" });
  const apiResponse = await (await fetch(`${API_BASE_URL}/subregion/Australia and New Zealand`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetchs specific countries with specific fields bu Subregion correctly", async () => {
  const countries = await getCountriesBySubregion({ subregion: "Central Europe", fields: ["startOfWeek", "area"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/subregion/Central Europe?fields=area,startOfWeek`)).json();
  expect(countries).toEqual(apiResponse);
});

test("should return null", async () => {
  const countries = await getCountriesBySubregion({ subregion: "aaaaaaabbb", fields: ["startOfWeek", "area"] });
  expect(countries).toEqual(null);
});
