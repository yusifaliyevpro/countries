import type { Currency } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("fetches the supported-currency catalog", async () => {
  const result = await rc.getCurrencies();

  expectTypeOf(result.currencies).toEqualTypeOf<Currency[] | undefined>();

  if (!result.success) throw result.error;

  // The catalog takes no `fields`, so there's no narrowing here — it's always
  // the full `Currency`, whose `symbol` is nullable (e.g. gold, "XAU").
  expectTypeOf(result.currencies).toEqualTypeOf<Currency[]>();
  expectTypeOf(result.currencies[0].symbol).toEqualTypeOf<string | null>();
  expectTypeOf(result.error).toEqualTypeOf<undefined>();

  expect(result.currencies.length).toBeGreaterThan(0);

  const usd = result.currencies.find((c) => c.code === "USD");
  expectTypeOf(usd).toEqualTypeOf<Currency | undefined>();

  expect(usd?.name).toBe("United States dollar");
  expect(usd?.symbol).toBe("$");
});

test("returns codes sorted ascending", async () => {
  const result = await rc.getCurrencies();
  if (!result.success) throw result.error;

  const codes = result.currencies.map((c) => c.code);
  expect(codes).toEqual(codes.toSorted());
});
