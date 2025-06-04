import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";

export async function getCountryByDemonym<T extends readonly (keyof Country)[]>(
  { demonym, fields }: { demonym: string; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T> | null> {
  try {
    const api = constructAPI({ route: "demonym", query: demonym, fields });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? (await response.json())[0] : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
