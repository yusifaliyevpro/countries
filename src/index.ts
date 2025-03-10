import { Capitals, Cca2Codes, Cca3Codes, Country } from "./types/country";

const API_BASE_URL = "https://restcountries.com/v3.1";

export async function getCountries<T extends keyof Country>(options?: {
  fields?: T[];
  independent?: boolean;
}): Promise<Pick<Country, T>[] | null> {
  try {
    const baseUrl = new URL(API_BASE_URL);
    if (options?.independent !== undefined) {
      baseUrl.pathname += "/independent";
      baseUrl.searchParams.set("status", String(options.independent));
    } else baseUrl.pathname += "/all";
    if (options?.fields && !!options.fields.length) baseUrl.searchParams.set("fields", options.fields.join(","));
    const response = await fetch(baseUrl.toString());
    if (!response.ok) console.log("Couldn't find any country");
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
  codes: (Cca2Codes | Cca3Codes)[];
  fields?: T[];
}): Promise<Pick<Country, T>[] | null> {
  try {
    const baseUrl = new URL(API_BASE_URL);
    baseUrl.pathname += "/alpha";
    if (fields && !!fields.length) baseUrl.searchParams.set("fields", fields.join(","));
    if (codes && !!codes.length) baseUrl.searchParams.set("codes", codes.join(","));
    const response = await fetch(baseUrl.toString());
    if (!response.ok) console.log("Couldn't find any country. It is my side error. Sorry🥲");
    return response.status === 200 && (await response.json());
  } catch (error) {
    console.log("An error occurred while fetching the countries data. Please try again later.");
    return null;
  }
}

export async function getCountryByCCA3<T extends keyof Country>({
  cca3,
  fields,
}: {
  cca3: Cca3Codes;
  fields?: T[];
}): Promise<Pick<Country, T> | null> {
  try {
    const baseUrl = new URL(API_BASE_URL);
    baseUrl.pathname += `/alpha/${cca3}`;
    if (fields && !!fields.length) baseUrl.searchParams.set("fields", fields.join(","));
    const response = await fetch(baseUrl.toString());
    if (!response.ok) console.log(`Could not fetch country data for CCA3 code: ${cca3}. Status: ${response.status}`);
    const data = await response.json();
    return response.status === 200 && (fields && !!fields.length ? data : data[0]);
  } catch (error) {
    console.log("An error occurred while fetching the country data. Please try again later.");
    return null;
  }
}

export async function getCountryByCCA2<T extends keyof Country>({
  cca2,
  fields,
}: {
  cca2: Cca2Codes;
  fields?: T[];
}): Promise<Pick<Country, T> | null> {
  try {
    const baseUrl = new URL(API_BASE_URL);
    baseUrl.pathname += `/alpha/${cca2}`;
    if (fields && !!fields.length) baseUrl.searchParams.set("fields", fields.join(","));
    const response = await fetch(baseUrl.toString());
    if (!response.ok) console.log(`Could not fetch country data for CCA3 code: ${cca2}. Status: ${response.status}`);
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
  capital: Capitals;
  fields?: T[];
}): Promise<Pick<Country, T> | null> {
  try {
    const baseurl = new URL(API_BASE_URL);
    baseurl.pathname += `/capital/${capital.toLowerCase()}`;
    if (fields && !!fields.length) baseurl.searchParams.set("fields", fields.join(","));
    const response = await fetch(baseurl.toString());
    if (!response.ok) console.log(`Could not fetch country data for Capital: ${capital}. Status: ${response.status}`);
    return response.status === 200 && (await response.json())[0];
  } catch (error) {
    console.log("An error occurred while fetching the country data. Please try again later.");
    return null;
  }
}
