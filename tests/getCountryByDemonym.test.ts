import { getCountryByDemonym } from "../src";
import { API_BASE_URL } from "../src/constants";

test("fetchs specific countries by Demonym correctly", async () => {
  const countries = await getCountryByDemonym({ demonym: "peruvian" });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/demonym/peruvian`)).json())[0];
  expect(countries).toEqual(apiResponse);
});

test("fetchs specific countries with specific fields by Demonym correctly", async () => {
  const countries = await getCountryByDemonym({ demonym: "peruvian", fields: ["startOfWeek", "area"] });
  const apiResponse = (await (await fetch(`${API_BASE_URL}/demonym/peruvian?fields=area,startOfWeek`)).json())[0];
  expect(countries).toEqual(apiResponse);
});
