import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker, Lang } from "../types";

/**
 * Fetches countries where the specified language is officially or widely spoken,
 * optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 *
 * @param params - An object containing:
 *   - `lang`: (e.g., "Spanish", "English", "Azerbaijani").
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to an array of `CountryPicker<T>` objects with the requested fields,
 *          or `null` if the request fails or no countries match the language criteria.
 *
 * @example
 * // Get countries where Spanish is spoken with `name` and `region` fields
 * const spanishSpeakingCountries = await getCountriesByLang({
 *   lang: "spa",
 *   fields: ["name", "region"]
 * });
 *
 * @example
 * // Get countries where English is spoken with all fields
 * const englishSpeakingCountries = await getCountriesByLang({ lang: "en" });
 */
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
