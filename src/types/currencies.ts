import * as z from "zod/mini";
import { CurrencyCode } from ".";

/**
 * Runtime schema for a **currency** from the REST Countries **Currencies** API,
 * and the source of truth for the {@link Currency} type. This is separate from a
 * country's `currencies` field (`Country["currencies"]`), which never carries a
 * `null` symbol.
 */
export const currencySchema = z.strictObject({
  code: z.string(),
  name: z.string(),
  /** `null` where the currency has no conventional sign (e.g. gold, `"XAU"`). */
  symbol: z.union([z.string(), z.null()]),
});

export type Currency = z.infer<typeof currencySchema>;

/** Runtime schema for a single result from the `convert` endpoint. */
export const currencyConversionSchema = z.strictObject({
  from: currencySchema,
  to: currencySchema,
  amount: z.number(),
  rate: z.number(),
  result: z.number(),
  as_of: z.iso.datetime(),
});

export type CurrencyConversion = z.infer<typeof currencyConversionSchema>;

/** Runtime schema for the exchange-rate table of a base currency (`rates` endpoint). */
export const currencyRatesSchema = z.strictObject({
  base: z.string(),
  as_of: z.iso.datetime(),
  rates: z.record(z.string(), z.number()),
});

export type CurrencyRates = z.infer<typeof currencyRatesSchema>;

/**
 * Discriminated result of {@link RestCountries.convertCurrency} — one
 * {@link CurrencyConversion} per `to` target under `conversions`.
 */
export type CurrencyConvertResult =
  | { success: true; conversions: CurrencyConversion[]; error: undefined }
  | { success: false; conversions: undefined; error: Error };

/**
 * Discriminated result of {@link RestCountries.getCurrencyRates}. The single
 * table is flattened onto the result, so read `base`, `as_of`, and `rates`.
 */
export type CurrencyRatesResult =
  | { success: true; base: CurrencyCode; as_of: string; rates: Record<CurrencyCode, number>; error: undefined }
  | { success: false; base: undefined; as_of: undefined; rates: undefined; error: Error };

/** Discriminated result of {@link RestCountries.getCurrencies} (the supported-currency catalog). */
export type CurrenciesResult =
  { success: true; currencies: Currency[]; error: undefined } | { success: false; currencies: undefined; error: Error };
