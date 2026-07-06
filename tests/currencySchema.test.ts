import { currencyConversionSchema, currencyRatesSchema, currencySchema } from "@yusifaliyevpro/countries";
import { rc } from "./client";

test("every currency in the catalog conforms to the Currency schema", async () => {
  const result = await rc.getCurrencies();
  if (!result.success) throw result.error;
  for (const currency of result.currencies) {
    const parsed = currencySchema.safeParse(currency);
    if (!parsed.success) {
      throw new Error(`${currency.code ?? "unknown"} failed schema validation:\n${JSON.stringify(parsed.error.issues, null, 2)}`);
    }
  }
});

test("a conversion conforms to the CurrencyConversion schema", async () => {
  const result = await rc.convertCurrency({ from: "USD", to: "EUR", amount: 100 });
  if (!result.success) throw result.error;
  const parsed = currencyConversionSchema.safeParse(result.conversions[0]);
  if (!parsed.success) throw new Error(JSON.stringify(parsed.error.issues, null, 2));
});

test("a rate table conforms to the CurrencyRates schema", async () => {
  const result = await rc.getCurrencyRates({ base: "USD" });
  if (!result.success) throw result.error;
  const { success, error, ...table } = result;
  const parsed = currencyRatesSchema.safeParse(table);
  if (!parsed.success) throw new Error(JSON.stringify(parsed.error.issues, null, 2));
});
