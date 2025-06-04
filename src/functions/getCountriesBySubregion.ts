import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker, Subregion } from "../types";

export async function getCountriesBySubregion<T extends readonly (keyof Country)[]>(
  { subregion, fields }: { subregion: Subregion; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T>[] | null> {
  try {
    const api = constructAPI({ route: "subregion", query: subregion as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
