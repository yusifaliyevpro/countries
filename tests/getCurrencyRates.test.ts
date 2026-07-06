import { rc } from "./client";

test("fetches the exchange-rate table for a base currency", async () => {
  const result = await rc.getCurrencyRates({ base: "USD" });
  if (!result.success) throw result.error;
  expect(result.base).toBe("USD");
  expect(typeof result.as_of).toBe("string");
  expect(typeof result.rates.EUR).toBe("number");
});

test("fails for an unknown base currency", async () => {
  const result = await rc.getCurrencyRates({ base: "ZZZ" });
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error).toBeInstanceOf(Error);
});
