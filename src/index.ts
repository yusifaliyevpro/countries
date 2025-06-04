import { Country } from "./types";
// import { getCountries } from "./functions/getCountries";

export const defineFields = <T extends (keyof Country)[]>(fields: readonly [...T]) => fields;

export { getCountries } from "./functions/getCountries";
export { getCountriesByCodes } from "./functions/getCountriesByCodes";
export { getCountriesByCurrency } from "./functions/getCountriesByCurrency";
export { getCountriesByLang } from "./functions/getCountriesByLang";
export { getCountriesByName } from "./functions/getCountriesByName";
export { getCountriesByRegion } from "./functions/getCountriesByRegion";
export { getCountriesBySubregion } from "./functions/getCountriesBySubregion";
export { getCountryByCapital } from "./functions/getCountryByCapital";
export { getCountryByCode } from "./functions/getCountryByCode";
export { getCountryByDemonym } from "./functions/getCountryByDemonym";
export { getCountryByTranslation } from "./functions/getCountryByTranslation";
