import type { Country } from "./types";

export { RestCountries } from "./client";
export type { CountryFilters, RestCountriesConfig } from "./client";
export { countrySchema } from "./types";
export type { Country, CountryList, CountryPicker, ResponseMeta } from "./types";

/**
 * Type-safe helper for declaring a `fields` array outside of a call site while
 * preserving the literal tuple type (so `CountryPicker` can narrow correctly).
 *
 * @example
 * const fields = defineFields(["names", "codes", "capitals"]);
 * const country = await restCountries.getCountryByCode({ code: "CAN", fields });
 */
export const defineFields = <T extends (keyof Country)[]>(fields: readonly [...T]): readonly [...T] => fields;
