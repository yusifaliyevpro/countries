import { constructAPI, handleNetworkError, handleNotFoundError } from "./helpers";
import { Capital, Cca2Code, Cca3Code, Ccn3Code, CiocCode, Country, Currency, Lang, Region, Subregion } from "./types";
export { constructAPI };

export async function getCountries<T extends keyof Country>(options?: {
  fields?: T[];
  independent?: boolean;
}): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ fields: options?.fields, status: options?.independent });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json());
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByRegion<T extends keyof Country>({
  region,
  fields,
}: {
  region: Region;
  fields?: T[];
}): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "region", query: region, fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json());
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesBySubregion<T extends keyof Country>({
  subregion,
  fields,
}: {
  subregion: Subregion;
  fields?: T[];
}): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "subregion", query: subregion as string, fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json());
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByCodes<T extends keyof Country>({
  codes,
  fields,
}: {
  codes: (Cca2Code | Cca3Code | CiocCode | Ccn3Code)[];
  fields?: T[];
}): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "alpha", codes: codes.join(","), fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json());
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByName<T extends keyof Country>({
  name,
  fullText,
  fields,
}: {
  name: string;
  fullText?: boolean;
  fields?: T[];
}): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "name", query: name, fields, fullText });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json());
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByLang<T extends keyof Country>({
  lang,
  fields,
}: {
  lang: Lang;
  fields?: T[];
}): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "lang", query: lang as string, fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json());
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountriesByCurrency<T extends keyof Country>({
  currency,
  fields,
}: {
  currency: Currency;
  fields?: T[];
}): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ route: "currency", query: currency as string, fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json());
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountryByCode<T extends keyof Country>({
  code,
  fields,
}: {
  code: Cca2Code | Cca3Code | CiocCode | Ccn3Code;
  fields?: T[];
}): Promise<Pick<Country, T> | null> {
  try {
    const api = constructAPI({ route: "alpha", query: code as string, fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    const data = await response.json();
    return response.ok && (fields && !!fields.length ? data : data[0]);
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountryByCapital<T extends keyof Country>({
  capital,
  fields,
}: {
  capital: Capital;
  fields?: T[];
}): Promise<Pick<Country, T> | null> {
  try {
    const api = constructAPI({ route: "capital", query: capital as string, fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json())[0];
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountryByTranslation<T extends keyof Country>({
  translation,
  fields,
}: {
  translation: string;
  fields?: T[];
}): Promise<Pick<Country, T> | null> {
  try {
    const api = constructAPI({ route: "translation", query: translation, fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json())[0];
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}

export async function getCountryByDemonym<T extends keyof Country>({
  demonym,
  fields,
}: {
  demonym: string;
  fields?: T[];
}): Promise<Pick<Country, T> | null> {
  try {
    const api = constructAPI({ route: "demonym", query: demonym, fields });
    const response = await fetch(api.toString());
    handleNotFoundError(response.ok);
    return response.ok && (await response.json())[0];
  } catch (error) {
    handleNetworkError(error);
    return null;
  }
}
