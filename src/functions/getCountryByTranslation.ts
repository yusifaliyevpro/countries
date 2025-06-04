import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";

export async function getCountryByTranslation<T extends readonly (keyof Country)[]>(
  { translation, fields }: { translation: string; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T> | null> {
  try {
    const api = constructAPI({ route: "translation", query: translation, fields });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? (await response.json())[0] : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
