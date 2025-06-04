import { constructAPI, handleNetworkError, handleNotFoundError } from "../helpers";
import { Country, CountryPicker, Region } from "../types";

export async function getCountriesByRegion<T extends readonly (keyof Country)[]>(
  { region, fields }: { region: Region; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T>[] | null> {
  try {
    const api = constructAPI({ route: "region", query: region, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
