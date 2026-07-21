import type { CurrencyCode } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches the exchange-rate table for a base currency", async () => {
  const result = await rc.getCurrencyRates({ base: "USD" });
  if (!result.success) throw result.error;

  // The rate table is flattened onto the result rather than nested under a key,
  // so `base` / `as_of` / `rates` all narrow together off the discriminant.
  expectTypeOf(result.base).toEqualTypeOf<CurrencyCode>();
  expectTypeOf(result.as_of).toBeNumber();
  expectTypeOf(result.rates).toEqualTypeOf<Record<CurrencyCode, number>>();
  expectTypeOf(result.rates.EUR).toBeNumber();
  expectTypeOf(result.error).toEqualTypeOf<undefined>();

  expect(result.base).toBe("USD");
  expect(typeof result.as_of).toBe("number");
  expect(typeof result.rates.EUR).toBe("number");

  // `typeof === "number"` also accepts NaN, Infinity, and 0 — none of which are
  // usable rates. Assert the table is actually well-formed.
  const rates = Object.values(result.rates);
  expect(rates.length).toBeGreaterThan(10);
  expect(rates.every((r) => Number.isFinite(r) && r > 0)).toBe(true);
  expect(result.rates.USD).toBe(1); // the base converts to itself
  expect(Number.isInteger(result.as_of)).toBe(true);
});

test("fails for an unknown base currency", async () => {
  const result = await rc.getCurrencyRates({ base: "ZZZ" });
  expect(result).toMatchObject({ success: false, error: expect.any(Error) });

  if (!result.success) {
    expectTypeOf(result.error).toEqualTypeOf<Error>();
    expectTypeOf(result.rates).toEqualTypeOf<undefined>();
    expectTypeOf(result.base).toEqualTypeOf<undefined>();
  }
});
