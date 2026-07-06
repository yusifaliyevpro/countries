import { CURRENCY_CODES } from "../src/data/currency_codes";
import { rc } from "./client";

test("CURRENCY_CODES is in sync with the live symbols catalog", async () => {
  const result = await rc.getCurrencies();
  if (!result.success) throw result.error;

  const present = new Set(result.currencies.map((c) => c.code));
  const listed = new Set<string>(CURRENCY_CODES);

  const missing = [...present].filter((code) => !listed.has(code)).sort();
  const stale = [...listed].filter((code) => !present.has(code)).sort();

  const problems: string[] = [];
  if (missing.length) problems.push(`MISSING from src/data/currency_codes.ts: ${missing.join(", ")}`);
  if (stale.length) problems.push(`STALE in src/data/currency_codes.ts: ${stale.join(", ")}`);
  if (problems.length) throw new Error(`CURRENCY_CODES is out of sync:\n${problems.join("\n")}`);
});
