import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker, Subregion } from "../types";

/**
 * Fetches countries that belong to the specified subregion,
 * optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 *
 * @param params - An object containing:
 *   - `subregion`: The subregion name (e.g., "Southern Asia", "Northern Europe") to filter countries by.
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to an array of `CountryPicker<T>` objects with the requested fields,
 *          or `null` if the request fails or no countries match the subregion.
 *
 * @example
 * // Get countries in Northern Europe with only `name` and `population` fields
 * const nordicCountries = await getCountriesBySubregion({
 *   subregion: "Northern Europe",
 *   fields: ["name", "population"]
 * });
 *
 * @example
 * // Get all fields for countries in Southern Asia
 * const southAsianCountries = await getCountriesBySubregion({ subregion: "Southern Asia" });
 */
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
