import { constructAPI } from "./helpers";
import { Capital, Cca2Code, Cca3Code, Ccn3Code, CiocCode, Country, Currency, Lang, Region, Subregion } from "./types";

export async function getCountries<T extends keyof Country>(options?: {
  fields?: T[];
  independent?: boolean;
}): Promise<Pick<Country, T>[] | null> {
  try {
    const api = constructAPI({ fields: options?.fields, status: options?.independent });
    const response = await fetch(api.toString());
    if (!response.ok) console.log("Couldn't find any country");
    return response.status === 200 && (await response.json());
  } catch (error) {
    console.log("An error occurred while fetching the countries data. Please try again later.");
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
    if (!response.ok) console.log("Couldn't find any country. It is my side error. Sorry🥲");
    return response.status === 200 && (await response.json());
  } catch (error) {
    console.log("An error occurred while fetching the countries data. Please try again later.");
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
    if (!response.ok) console.log("Couldn't find any country. It is my side error. Sorry🥲");
    return response.status === 200 && (await response.json());
  } catch (error) {
    console.log("An error occurred while fetching the countries data. Please try again later.");
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
    if (!response.ok) console.log("Couldn't find any country. It is my side error. Sorry🥲");
    return response.status === 200 && (await response.json());
  } catch (error) {
    console.log("An error occurred while fetching the countries data. Please try again later.");
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
    if (!response.ok) console.log(`Could not fetch country data for Capital: ${lang}. Status: ${response.status}`);
    return response.status === 200 && (await response.json());
  } catch (error) {
    console.log("An error occurred while fetching the country data. Please try again later.");
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
    if (!response.ok) console.log(`Could not fetch country data for Capital: ${currency}. Status: ${response.status}`);
    return response.status === 200 && (await response.json());
  } catch (error) {
    console.log("An error occurred while fetching the country data. Please try again later.");
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
    if (!response.ok) console.log(`Could not fetch country data for code: ${code}. Status: ${response.status}`);
    const data = await response.json();
    return response.status === 200 && (fields && !!fields.length ? data : data[0]);
  } catch (error) {
    console.log("An error occurred while fetching the country data. Please try again later.");
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
    if (!response.ok) console.log(`Could not fetch country data for Capital: ${capital}. Status: ${response.status}`);
    return response.status === 200 && (await response.json())[0];
  } catch (error) {
    console.log("An error occurred while fetching the country data. Please try again later.");
    return null;
  }
}
