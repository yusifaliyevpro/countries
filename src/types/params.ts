import { Capital, Cca2Code, Cca3Code, Ccn3Code, CiocCode, Currency, Lang, Region, Subregion } from ".";

type CodeVariant = Cca2Code | Cca3Code | CiocCode | Ccn3Code;
type Fields<T> = { fields?: T };

export type ByCodesParams<T> = { codes: CodeVariant[] } & Fields<T>;
export type ByNameParams<T> = { name: string; fullText?: boolean } & Fields<T>;
export type GetCountriesParams<T> = { independent?: boolean } & Fields<T>;
export type ByRegionParams<T> = { region: Region } & Fields<T>;
export type BySubregionParams<T> = { subregion: Subregion } & Fields<T>;
export type ByLangParams<T> = { lang: Lang } & Fields<T>;
export type ByCurrencyParams<T> = { currency: Currency } & Fields<T>;
export type ByCodeParams<T> = { code: CodeVariant } & Fields<T>;
export type ByCapitalParams<T> = { capital: Capital } & Fields<T>;
export type ByTranslationParams<T> = { translation: string } & Fields<T>;
export type ByDemonymParams<T> = { demonym: string } & Fields<T>;
