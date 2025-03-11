import { getCountries } from "../src";
import { API_BASE_URL } from "../src/constants";

test("fetchs all countries correctly", async () => {
  const countries = await getCountries();
  const apiResponse = await (await fetch(`${API_BASE_URL}/all`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetchs all countries with specific fields correctly", async () => {
  const countries = await getCountries({ fields: ["startOfWeek", "area"] });
  const apiResponse = await (await fetch(`${API_BASE_URL}/all?fields=area,startOfWeek`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetchs only independent countries", async () => {
  const countries = await getCountries({ independent: false });
  const apiResponse = await (await fetch(`${API_BASE_URL}/independent?status=false`)).json();
  expect(countries).toEqual(apiResponse);
});

test("fetchs only independent countries with specific fields", async () => {
  const countries = await getCountries({ fields: ["area"], independent: true });
  const apiResponse = await (await fetch(`${API_BASE_URL}/independent?status=true&fields=area`)).json();
  expect(countries).toEqual(apiResponse);
});
