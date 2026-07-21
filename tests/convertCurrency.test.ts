import type { CurrencyConversion } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("converts an amount from one currency to another", async () => {
  const result = await rc.convertCurrency({ from: "USD", to: "EUR", amount: 100 });
  if (!result.success) throw result.error;

  // A single `to` still yields an array — the shape doesn't change with arity.
  expectTypeOf(result.conversions).toEqualTypeOf<CurrencyConversion[]>();
  expectTypeOf(result.error).toEqualTypeOf<undefined>();

  expect(result.conversions).toHaveLength(1);
  const [conversion] = result.conversions;

  expectTypeOf(conversion).toEqualTypeOf<CurrencyConversion>();
  expectTypeOf(conversion.from.symbol).toEqualTypeOf<string | null>();
  expectTypeOf(conversion.rate).toBeNumber();

  expect(conversion.from.code).toBe("USD");
  expect(conversion.to.code).toBe("EUR");
  expect(conversion.amount).toBe(100);
  expect(conversion.result).toBeCloseTo(conversion.rate * 100, 5);
});

test("defaults amount to 1 when omitted", async () => {
  const result = await rc.convertCurrency({ from: "USD", to: "EUR" });
  if (!result.success) throw result.error;

  // `amount` is optional on the way in, always present on the way out.
  expectTypeOf<Parameters<typeof rc.convertCurrency>[0]["amount"]>().toEqualTypeOf<number | undefined>();
  expectTypeOf(result.conversions[0].amount).toBeNumber();

  expect(result.conversions[0].amount).toBe(1);
  expect(result.conversions[0].result).toBeCloseTo(result.conversions[0].rate, 5);
});

test("accepts up to 5 targets and returns them in order", async () => {
  // Exercise the full documented arity — the test is named for 5, so send 5.
  const targets = ["EUR", "GBP", "CAD", "JPY", "AUD"];
  const result = await rc.convertCurrency({ from: "USD", to: targets, amount: 100 });
  if (!result.success) throw result.error;

  // `to` accepts one code or an array of them.
  expectTypeOf(result.conversions).toEqualTypeOf<CurrencyConversion[]>();
  expectTypeOf(targets).toExtend<Parameters<typeof rc.convertCurrency>[0]["to"]>();

  expect(result.conversions).toHaveLength(targets.length);
  expect(result.conversions.map((c) => c.to.code)).toEqual(targets);
  // Every conversion must share the source and the amount, and be internally
  // consistent — order alone doesn't prove the rows aren't garbage.
  expect(result.conversions.every((c) => c.from.code === "USD" && c.amount === 100)).toBe(true);
  for (const c of result.conversions) expect(c.result).toBeCloseTo(c.rate * 100, 5);
});

test("treats codes case-insensitively", async () => {
  const result = await rc.convertCurrency({ from: "usd", to: "eur" });
  if (!result.success) throw result.error;

  expectTypeOf(result.conversions[0].from.code).toBeString();

  expect(result.conversions[0].from.code).toBe("USD");
  expect(result.conversions[0].to.code).toBe("EUR");
});

test("fails for an unknown source currency", async () => {
  const result = await rc.convertCurrency({ from: "ZZZ", to: "EUR" });
  expect(result).toMatchObject({ success: false, error: expect.any(Error) });

  if (!result.success) {
    expectTypeOf(result.error).toEqualTypeOf<Error>();
    expectTypeOf(result.conversions).toEqualTypeOf<undefined>();
  }
});
