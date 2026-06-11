import { countrySchema } from "@yusifaliyevpro/countries";
import { rc } from "./client";

// Well-populated sovereign countries that exercise every documented field.
const samples = ["CAN", "DEU", "USA", "JPN", "BRA"] as const;

// `countrySchema` is the single source of truth for the `Country` type, so
// validating a real v5 response against it confirms our types still match the
// API. `strictObject` makes this fail if the API adds a field we don't model.
test.each(samples)("the v5 response for %s conforms to the Country schema", async (code) => {
  const country = await rc.getCountryByCode({ code });
  expect(country).not.toBeNull();

  const result = countrySchema.safeParse(country);
  if (!result.success) {
    const details = result.error.issues
      .map((issue: { path: PropertyKey[]; message: string }) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Schema mismatches for ${code}:\n${details}`);
  }
});
