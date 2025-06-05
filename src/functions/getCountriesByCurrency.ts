import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker, Currency } from "../types";

/**
 * Fetches countries that use the specified currency, optionally including only the specified fields.
 *
 * > **Note:** If `fields` is not provided, all available fields will be returned.
 *
 * @param params - An object containing:
 *   - `currency`: The currency code (e.g., "USD", "EUR", "JPY") used to filter countries.
 *   - `fields`: An optional array of field names (keys from the `Country` type) to include in the response.
 *
 * @param fetchOptions - Optional `RequestInit` object to customize the `fetch` request.
 *
 * @returns A promise that resolves to an array of `CountryPicker<T>` objects with the requested fields,
 *          or `null` if the request fails or no countries use the specified currency.
 *
 * @example
 * // Get countries using the Euro with only `name` and `flags` fields
 * const euroCountries = await getCountriesByCurrency({
 *   currency: "EUR",
 *   fields: ["name", "flags"]
 * });
 *
 * @example
 * // Get countries using the Japanese Yen with all fields
 * const yenCountries = await getCountriesByCurrency({ currency: "JPY" });
 */
export async function getCountriesByCurrency<T extends readonly (keyof Country)[]>(
  { currency, fields }: { currency: Currency; fields?: T },
  fetchOptions?: RequestInit
): Promise<CountryPicker<T>[] | null> {
  try {
    const api = constructAPI({ route: "currency", query: currency as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
