import type { Country } from "@yusifaliyevpro/countries";
import { NOT_FOUND_MESSAGE } from "../src/helpers";
import { rc } from "./client";

test("fetches a country by capital", async () => {
  const result = await rc.getCountryByCapital({ capital: "Baku", fields: ["names", "capitals"] });
  if (!result.success) throw result.error;

  expectTypeOf(result.country).toEqualTypeOf<Pick<Country, "names" | "capitals">>();
  expectTypeOf(result.country.capitals).toEqualTypeOf<Country["capitals"]>();
  expectTypeOf(result.country.capitals[0].coordinates).toEqualTypeOf<{ lat: number; lng: number }>();

  expect(result.country.names.common).toBe("Azerbaijan");
  expect(result.country.capitals.some((cap) => cap.name === "Baku")).toBe(true);
});

test("fails for an unknown capital", async () => {
  const result = await rc.getCountryByCapital({ capital: "ksdsdmkoasl", fields: ["names"] });
  if (result.success) throw new Error(`expected a failure, got ${result.country.names.common}`);

  expectTypeOf(result.error).toEqualTypeOf<Error>();
  expectTypeOf(result.country).toEqualTypeOf<undefined>();

  // A lookup miss is the *not-found* path, not an HTTP failure: the request
  // returns 200 with zero objects and the library synthesizes this error
  // (src/client.ts `#first`). Pinning the message distinguishes a genuine miss
  // from a 4xx/5xx, which `success === false` alone would happily conflate.
  expect(result.country).toBeUndefined();
  expect(result.error).toBeInstanceOf(Error);
  expect(result.error.message).toBe(NOT_FOUND_MESSAGE);
  expect(result.error.cause).toBeUndefined();
});
