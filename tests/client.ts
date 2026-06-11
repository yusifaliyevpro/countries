import { RestCountries } from "@yusifaliyevpro/countries";

/** Shared client used across the test suite. */
export const rc = new RestCountries({ apiKey: process.env.REST_COUNTRIES_API_KEY as string });
