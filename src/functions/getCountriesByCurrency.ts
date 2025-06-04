import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker, Currency } from "../types";

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
