import { Capital, Cca2Code, Cca3Code, Ccn3Code, CiocCode, Currency, Lang, Region, Subregion } from ".";

export type ByCodesParams<T> = { codes: (Cca2Code | Cca3Code | CiocCode | Ccn3Code)[]; fields?: T[] };
export type ByNameParams<T> = { name: string; fullText?: boolean; fields?: T[] };
export type GetCountriesParams<T> = { independent?: boolean; fields?: T[] };
export type ByRegionParams<T> = { region: Region; fields?: T[] };
export type BySubregionParams<T> = { subregion: Subregion; fields?: T[] };
export type ByLangParams<T> = { lang: Lang; fields?: T[] };
export type ByCurrencyParams<T> = { currency: Currency; fields?: T[] };
export type ByCodeParams<T> = { code: Cca2Code | Cca3Code | CiocCode | Ccn3Code; fields?: T[] };
export type ByCapitalParams<T> = { capital: Capital; fields?: T[] };
export type ByTranslationParams<T> = { translation: string; fields?: T[] };
export type ByDemonymParams<T> = { demonym: string; fields?: T[] };
