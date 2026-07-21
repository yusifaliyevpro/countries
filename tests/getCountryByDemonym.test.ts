import type { Country } from "@yusifaliyevpro/countries";
import { NOT_FOUND_MESSAGE } from "../src/helpers";
import { rc } from "./client";

test("fetches a country by demonym", async () => {
  const result = await rc.getCountryByDemonym({ demonym: "Peruvian", fields: ["names"] });
  if (!result.success) throw result.error;

  expectTypeOf(result.country).toEqualTypeOf<Pick<Country, "names">>();
  expectTypeOf(result.country).not.toHaveProperty("demonyms");

  expect(result.country.names.common).toBe("Peru");
});

test("fails for an unknown demonym", async () => {
  const result = await rc.getCountryByDemonym({ demonym: "aaabbbcccc", fields: ["names"] });
  if (result.success) throw new Error(`expected a failure, got ${result.country.names.common}`);

  expectTypeOf(result.error).toEqualTypeOf<Error>();
  expectTypeOf(result.country).toEqualTypeOf<undefined>();

  // The not-found path: 200 with zero objects, error synthesized by the client
  // (no HTTP cause). Distinguishes a real miss from a 4xx/5xx.
  expect(result.country).toBeUndefined();
  expect(result.error.message).toBe(NOT_FOUND_MESSAGE);
  expect(result.error.cause).toBeUndefined();
});
