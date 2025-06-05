import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";
import { Code } from "../types/common";

/**
 * Fetches countries by their codes (e.g., CCA2, CCA3, or CIOC), optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 *
 * @param params - An object containing:
 *   - `codes`: An array of country codes to fetch data for. CCA3 is recommended for precision.
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to an array of `CountryPicker<T>` objects with the requested fields,
 *          or `null` if the request fails or the countries are not found.
 *
 * @example
 * // Get countries by CCA3 codes with only `name` and `flags` fields
 * const countries = await getCountriesByCodes({
 *   codes: ["USA", "FRA", "JPN"],
 *   fields: ["name", "flags"]
 * });
 *
 * @example
 * // Get countries by CCA2 codes with all fields
 * const countries = await getCountriesByCodes({ codes: ["US", "FR", "JP"] });
 */
export async function getCountriesByCodes<T extends readonly (keyof Country)[]>(
  { codes, fields }: { codes: Code[]; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T>[] | null> {
  try {
    const api = constructAPI({ route: "alpha", codes: codes.join(","), fields });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
