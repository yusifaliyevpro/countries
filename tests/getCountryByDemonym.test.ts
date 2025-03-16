import { getCountryByDemonym } from "../src";
import { API_BASE_URL } from "../src/constants";

test("fetchs specific country by Demonym correctly", async () => {
  const country = await getCountryByDemonym({ demonym: "peruvian" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/demonym/peruvian`)).json())[0];
  expect(country).toEqual(apiResponse);
});

test("fetchs specific country with specific fields by Demonym correctly", async () => {
  const country = await getCountryByDemonym({ demonym: "peruvian", fields: ["startOfWeek", "area"] });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/demonym/peruvian?fields=area,startOfWeek`)).json())[0];
  expect(country).toEqual(apiResponse);
});

test("should return null", async () => {
  const country = await getCountryByDemonym({ demonym: "aaabbbcccc", fields: ["startOfWeek", "area"] });
  expect(country).toEqual(null);
});
