import { getCountriesByCodes } from "../src";
import { API_BASE_URL } from "../src/constants";

test("fetchs specific countries correctly", async () => {
  const countries = await getCountriesByCodes({ codes: ["aze,tr"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/alpha?codes=aze,tr`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetchs specific countries with specific fields correctly", async () => {
  const countries = await getCountriesByCodes({ codes: ["aze", "tr"], fields: ["startOfWeek", "area"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/alpha?codes=aze,tr&fields=area,startOfWeek`)).json();
  expect(countries).toEqual(apiResponse);
});
