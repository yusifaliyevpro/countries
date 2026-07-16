import { currencyConversionSchema, currencyRatesSchema, currencySchema } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("every currency in the catalog conforms to the Currency schema", async () => {
  const result = await rc.getCurrencies();
  if (!result.success) throw result.error;
  const failures = result.currencies
    .map((currency) => ({ currency, parsed: currencySchema.safeParse(currency) }))
    .filter(({ parsed }) => !parsed.success)
    .map(({ currency, parsed }) => `${currency.code ?? "unknown"}: ${JSON.stringify(parsed.error?.issues, null, 2)}`);
  expect(failures).toEqual([]);
});

test("a conversion conforms to the CurrencyConversion schema", async () => {
  const result = await rc.convertCurrency({ from: "USD", to: "EUR", amount: 100 });
  if (!result.success) throw result.error;
  const parsed = currencyConversionSchema.safeParse(result.conversions[0]);
  expect(parsed.success).toEqual(true);
  expect(parsed.error?.issues ?? []).toEqual([]);
});

test("a rate table conforms to the CurrencyRates schema", async () => {
  const result = await rc.getCurrencyRates({ base: "USD" });
  if (!result.success) throw result.error;
  // oxlint-disable-next-line no-unused-vars
  const { success, error, ...table } = result;
  const parsed = currencyRatesSchema.safeParse(table);
  expect(parsed.success).toEqual(true);
  expect(parsed.error?.issues ?? []).toEqual([]);
});
