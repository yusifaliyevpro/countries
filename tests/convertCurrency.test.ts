import { rc } from "./client";

test("converts an amount from one currency to another", async () => {
  const result = await rc.convertCurrency({ from: "USD", to: "EUR", amount: 100 });
  if (!result.success) throw result.error;
  expect(result.conversions).toHaveLength(1);
  const [conversion] = result.conversions;
  expect(conversion.from.code).toBe("USD");
  expect(conversion.to.code).toBe("EUR");
  expect(conversion.amount).toBe(100);
  expect(conversion.result).toBeCloseTo(conversion.rate * 100, 5);
});

test("defaults amount to 1 when omitted", async () => {
  const result = await rc.convertCurrency({ from: "USD", to: "EUR" });
  if (!result.success) throw result.error;
  expect(result.conversions[0].amount).toBe(1);
  expect(result.conversions[0].result).toBeCloseTo(result.conversions[0].rate, 5);
});

test("accepts up to 5 targets and returns them in order", async () => {
  const result = await rc.convertCurrency({ from: "USD", to: ["EUR", "GBP", "CAD"], amount: 100 });
  if (!result.success) throw result.error;
  expect(result.conversions.map((c) => c.to.code)).toEqual(["EUR", "GBP", "CAD"]);
});

test("treats codes case-insensitively", async () => {
  const result = await rc.convertCurrency({ from: "usd", to: "eur" });
  if (!result.success) throw result.error;
  expect(result.conversions[0].from.code).toBe("USD");
  expect(result.conversions[0].to.code).toBe("EUR");
});

test("fails for an unknown source currency", async () => {
  const result = await rc.convertCurrency({ from: "ZZZ", to: "EUR" });
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error).toBeInstanceOf(Error);
});
