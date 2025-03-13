import { constructAPI, handleNetworkError, handleNotFoundError } from "./helpers";
import {
  GetCountriesParams,
  ByCapitalParams,
  ByCodeParams,
  ByCodesParams,
  ByCurrencyParams,
  ByDemonymParams,
  ByLangParams,
  ByNameParams,
  ByRegionParams,
  BySubregionParams,
  ByTranslationParams,
} from "./types/params";
import { Country } from "./types";

export async function getCountries<T extends keyof Country>(
  options?: GetCountriesParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T>[] | null> {
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

export async function getCountriesByRegion<T extends keyof Country>(
  { region, fields }: ByRegionParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "region", query: region, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesBySubregion<T extends keyof Country>(
  { subregion, fields }: BySubregionParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "subregion", query: subregion as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByCodes<T extends keyof Country>(
  { codes, fields }: ByCodesParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "alpha", codes: codes.join(","), fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByName<T extends keyof Country>(
  { name, fullText, fields }: ByNameParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "name", query: name, fields, fullText });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByLang<T extends keyof Country>(
  { lang, fields }: ByLangParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "lang", query: lang as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByCurrency<T extends keyof Country>(
  { currency, fields }: ByCurrencyParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "currency", query: currency as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? await response.json() : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountryByCode<T extends keyof Country>(
  { code, fields }: ByCodeParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T> | null> {
  try {
    const api = constructAPI({ route: "alpha", query: code as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    const data = await response.json();
    return response.ok ? (fields && !!fields.length ? data : data[0]) : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountryByCapital<T extends keyof Country>(
  { capital, fields }: ByCapitalParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T> | null> {
  try {
    const api = constructAPI({ route: "capital", query: capital as string, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? (await response.json())[0] : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountryByTranslation<T extends keyof Country>(
  { translation, fields }: ByTranslationParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T> | null> {
  try {
    const api = constructAPI({ route: "translation", query: translation, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? (await response.json())[0] : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountryByDemonym<T extends keyof Country>(
  { demonym, fields }: ByDemonymParams<T>,
  fetchOptions?: RequestInit
): Promise<Pick<Country, T> | null> {
  try {
    const api = constructAPI({ route: "demonym", query: demonym, fields });
    const response = await fetch(api.toString(), fetchOptions);
    handleNotFoundError(response.ok);
    return response.ok ? (await response.json())[0] : null;
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
