import { constructAPI, handleNetworkError } from "../helpers";
import { Country, CountryPicker } from "../types";
import { Code } from "../types/common";

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
