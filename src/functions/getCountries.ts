import { constructAPI, handleNetworkError, handleNotFoundError } from "../helpers";
import { Country, CountryPicker } from "../types";

/**
 * Retrieves a list of countries, optionally filtered by independence status,
 * and including only the specified fields.
 *
 * > **Note:** The `fields` parameter is required, as mandated by Alejandro Matos.
 *
 * @param options - Optional parameters used to filter the countries and select specific fields:
 *   - `fields`: A required array of field names (keys from the `Country` type) to include in the response.
 *   - `independent`: If true, only includes independent countries; if false, only dependent ones.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to an array of `CountryPicker<T>` objects with the requested fields,
 *          or `null` if the request fails or no countries match the criteria.
 *
 * @example
 * // Get all countries with only the `name` and `area` fields
 * const countries = await getCountries({ fields: ["name", "area"] });
 *
 * @example
 * // Get all independent countries with only the `name` and `area` fields
 * const independentCountries = await getCountries({
 *   independent: true,
 *   fields: ["name", "area"]
 * });
 */
export async function getCountries<T extends readonly (keyof Country)[]>(
  options?: { independent?: boolean; fields: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T>[] | null> {
  try {
    const api = constructAPI({ fields: options?.fields, status: options?.independent });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
