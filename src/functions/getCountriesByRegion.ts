import { constructAPI, handleNetworkError, handleNotFoundError } from "../helpers";
import { Country, CountryPicker, Region } from "../types";

/**
 * Fetches countries that belong to the specified world region,
 * optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 *
 * @param params - An object containing:
 *   - `region`: The name of the region (e.g., "Asia", "Europe", "Africa") to filter countries by.
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to an array of `CountryPicker<T>` objects with the requested fields,
 *          or `null` if the request fails or the region is not found.
 *
 * @example
 * // Get Asian countries with only `name` and `population` fields
 * const asianCountries = await getCountriesByRegion({
 *   region: "Asia",
 *   fields: ["name", "population"]
 * });
 *
 * @example
 * // Get all fields for countries in Europe
 * const europeanCountries = await getCountriesByRegion({ region: "Europe" });
 */
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
