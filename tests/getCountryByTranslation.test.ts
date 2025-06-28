import { getCountryByTranslation } from "../dist";
import { API_BASE_URL } from "../src/constants";

test("fetchs specific country by Translation correctly", async () => {
  const country = await getCountryByTranslation({ translation: "alemania" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/translation/alemania`)).json())[0];
  expect(country).toEqual(apiResponse);
});

test("fetchs specific country with specific fields bu Translation correctly", async () => {
  const country = await getCountryByTranslation({ translation: "Saksamaa", fields: ["startOfWeek", "area"] });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/translation/Saksamaa?fields=area,startOfWeek`)).json())[0];
  expect(country).toEqual(apiResponse);
});

test("should return null", async () => {
  const country = await getCountryByTranslation({ translation: "aaabccc", fields: ["startOfWeek", "area"] });
  expect(country).toEqual(null);
});
