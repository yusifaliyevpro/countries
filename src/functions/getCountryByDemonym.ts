import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";

/**
 * Fetches a single country by its demonym (the name for its residents),
 * optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 * > Returns the first matching country or `null` if none is found.
 *
 * @param params - An object containing:
 *   - `demonym`: The demonym string to search for (e.g., "American", "French").
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to a single `CountryPicker<T>` object with the requested fields,
 *          or `null` if the request fails or no country matches the demonym.
 *
 * @example
 * // Get country by demonym "Canadian" with only `name` and `region` fields
 * const canada = await getCountryByDemonym({
 *   demonym: "Canadian",
 *   fields: ["name", "region"]
 * });
 *
 * @example
 * // Get all fields for the country with demonym "Brazilian"
 * const brazil = await getCountryByDemonym({ demonym: "Brazilian" });
 */
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
