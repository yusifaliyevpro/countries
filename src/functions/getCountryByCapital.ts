import { constructAPI, handleNetworkError } from "../helpers";
import { Capital, Country, CountryPicker } from "../types";

export async function getCountryByCapital<T extends readonly (keyof Country)[]>(
  { capital, fields }: { capital: Capital; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T> | null> {
  try {
    const api = constructAPI({ route: "capital", query: capital as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? (await response.json())[0] : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
