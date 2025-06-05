import { constructAPI, handleNetworkError } from "../helpers";
import { Capital, Country, CountryPicker } from "../types";

/**
 * Fetches a single country by its capital city,
 * optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 * > Returns the first matching country or `null` if none is found.
 *
 * @param params - An object containing:
 *   - `capital`: The name of the capital city to search for.
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to a single `CountryPicker<T>` object with the requested fields,
 *          or `null` if the request fails or no country matches the capital city.
 *
 * @example
 * // Get country by capital "Paris" with only `name` and `region` fields
 * const country = await getCountryByCapital({
 *   capital: "Paris",
 *   fields: ["name", "region"]
 * });
 *
 * @example
 * // Get all fields for the country with capital "Tokyo"
 * const japan = await getCountryByCapital({ capital: "Tokyo" });
 */
export async function getCountryByCapital<T extends readonly (keyof Country)[]>(
  { capital, fields }: { capital: Capital; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T> | null> {
  try {
    const api = constructAPI({ route: "capital", query: capital as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? (await response.json())[0] : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
