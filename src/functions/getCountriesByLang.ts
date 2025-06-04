import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker, Lang } from "../types";

export async function getCountriesByLang<T extends readonly (keyof Country)[]>(
  { lang, fields }: { lang: Lang; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T>[] | null> {
  try {
    const api = constructAPI({ route: "lang", query: lang as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
