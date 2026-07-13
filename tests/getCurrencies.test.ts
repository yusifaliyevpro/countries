import { rc } from "./client";

test("fetches the supported-currency catalog", async () => {
  const result = await rc.getCurrencies();
  if (!result.success) throw result.error;
  expect(result.currencies.length).toBeGreaterThan(0);

  const usd = result.currencies.find((c) => c.code === "USD");
  expect(usd?.name).toBe("United States dollar");
  expect(usd?.symbol).toBe("$");
});

test("returns codes sorted ascending", async () => {
  const result = await rc.getCurrencies();
  if (!result.success) throw result.error;
  const codes = result.currencies.map((c) => c.code);
  expect(codes).toEqual([...codes].sort());
});
