import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";
import { Code } from "../types/common";

/**
 * Fetches a single country by its code (e.g., CCA2, CCA3, or CIOC),
 * optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 * > Returns the first matching country or `null` if none is found.
 *
 * @param params - An object containing:
 *   - `code`: The country code to fetch data for. CCA3 is recommended for precision.
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to a single `CountryPicker<T>` object with the requested fields,
 *          or `null` if the request fails or no country matches the code.
 *
 * @example
 * // Get country by CCA3 code "USA" with only `name` and `flags` fields
 * const usa = await getCountryByCode({
 *   code: "USA",
 *   fields: ["name", "flags"]
 * });
 *
 * @example
 * // Get all fields for the country with code "FRA"
 * const france = await getCountryByCode({ code: "FRA" });
 */
export async function getCountryByCode<T extends readonly (keyof Country)[]>(
  { code, fields }: { code: Code; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T> | null> {
  try {
    const api = constructAPI({ route: "alpha", query: code as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    const data = await response.json();
    return response.ok ? (fields && !!fields.length ? data : data[0]) : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
