import { getCountryByTranslation } from "../src";
import { API_BASE_URL } from "../src/constants";

test("fetchs specific countries by Translation correctly", async () => {
  const countries = await getCountryByTranslation({ translation: "alemania" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/translation/alemania`)).json())[0];
  expect(countries).toEqual(apiResponse);
});

test("fetchs specific countries with specific fields bu Translation correctly", async () => {
  const countries = await getCountryByTranslation({ translation: "Saksamaa", fields: ["startOfWeek", "area"] });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/translation/Saksamaa?fields=area,startOfWeek`)).json())[0];
  expect(countries).toEqual(apiResponse);
});
