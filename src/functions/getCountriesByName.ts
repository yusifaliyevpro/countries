import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";

/**
 * Fetches countries that match a given name or partial name,
 * optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 * > Set `fullText` to `true` to require an exact, full-name match.
 *
 * @param params - An object containing:
 *   - `name`: The country name or partial name to search for (e.g., "united").
 *   - `fullText`: Optional boolean to indicate whether to match full names exactly.
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to an array of `CountryPicker<T>` objects with the requested fields,
 *          or `null` if the request fails or no countries match the name.
 *
 * @example
 * // Search countries containing "united" with only `name` and `flags` fields
 * const results = await getCountriesByName({
 *   name: "united",
 *   fields: ["name", "flags"]
 * });
 *
 * @example
 * // Search for exact match of "Finland" with all fields
 * const country = await getCountriesByName({ name: "Finland", fullText: true });
 */
export async function getCountriesByName<T extends readonly (keyof Country)[]>(
  { name, fullText, fields }: { name: string; fullText?: boolean; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T>[] | null> {
  try {
    const api = constructAPI({ route: "name", query: name, fields, fullText });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
