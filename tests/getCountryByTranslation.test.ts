import type { Country } from "@yusifaliyevpro/countries";
import { NOT_FOUND_MESSAGE } from "../src/helpers";
import { rc } from "./client";

test("fetches a country by translated name", async () => {
  const result = await rc.getCountryByTranslation({ translation: "Deutschland", fields: ["names"] });
  if (!result.success) throw result.error;

  expectTypeOf(result.country).toEqualTypeOf<Pick<Country, "names">>();

  // Translation keys are a LiteralUnion: known codes autocomplete, unknown ones
  // still type-check, and every entry is optional.
  expectTypeOf(result.country.names.translations.deu).toEqualTypeOf<{ common: string; official: string } | undefined>();

  expect(result.country.names.common).toBe("Germany");
});

test("fails for an unknown translation", async () => {
  const result = await rc.getCountryByTranslation({ translation: "aaabccc", fields: ["names"] });
  if (result.success) throw new Error(`expected a failure, got ${result.country.names.common}`);

  expectTypeOf(result.error).toEqualTypeOf<Error>();
  expectTypeOf(result.country).toEqualTypeOf<undefined>();

  // The not-found path: 200 with zero objects, error synthesized by the client
  // (no HTTP cause). Distinguishes a real miss from a 4xx/5xx.
  expect(result.country).toBeUndefined();
  expect(result.error.message).toBe(NOT_FOUND_MESSAGE);
  expect(result.error.cause).toBeUndefined();
});
