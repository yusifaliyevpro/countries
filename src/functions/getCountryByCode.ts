import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";
import { Code } from "../types/common";

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
