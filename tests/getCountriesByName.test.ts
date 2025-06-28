import { getCountriesByName } from "../dist";
import { API_BASE_URL } from "../src/constants";

test("fetchs specific countries by Name correctly", async () => {
  const countries = await getCountriesByName({ name: "deutschland" });
  const apiResponse = await (await fetch(`${API_BASE_URL}/name/deutschland`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetchs specific countries with specific fields bu Name correctly", async () => {
  const countries = await getCountriesByName({ name: "aruba", fullText: true, fields: ["startOfWeek", "area"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/name/aruba?fields=area,startOfWeek&fullText=true`)).json();
  expect(countries).toEqual(apiResponse);
});

test("should return null", async () => {
  const countries = await getCountriesByName({ name: "akskaks", fullText: true, fields: ["startOfWeek", "area"] });
  expect(countries).toEqual(null);
});
