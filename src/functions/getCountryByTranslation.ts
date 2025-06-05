import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";

/**
 * Fetches a single country by a translated country name,
 * optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 * > Returns the first matching country or `null` if none is found.
 *
 * @param params - An object containing:
 *   - `translation`: The translated name of the country to search for.
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to a single `CountryPicker<T>` object with the requested fields,
 *          or `null` if the request fails or no country matches the translation.
 *
 * @example
 * // Get country by translation "Alemania" (German for Germany) with only `name` and `region` fields
 * const germany = await getCountryByTranslation({
 *   translation: "Alemania",
 *   fields: ["name", "region"]
 * });
 *
 * @example
 * // Get all fields for the country with translation "Espagne" (French for Spain)
 * const spain = await getCountryByTranslation({ translation: "Espagne" });
 */
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
