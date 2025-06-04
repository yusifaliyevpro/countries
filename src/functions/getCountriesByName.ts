import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";

export async function getCountriesByName<T extends readonly (keyof Country)[]>(
  { name, fullText, fields }: { name: string; fullText?: boolean; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T>[] | null> {
  try {
    const api = constructAPI({ route: "name", query: name, fields, fullText });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
