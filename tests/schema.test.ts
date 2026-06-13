import { countrySchema } from "@yusifaliyevpro/countries";
import { $ZodIssue } from "zod/v4/core";
import { loadAllCountries } from "./all-countries";

function formatIssues(issues: $ZodIssue[], base = ""): string[] {
  const lines: string[] = [];
  for (const issue of issues) {
    const path = [base, ...issue.path.map(String)].filter(Boolean).join(".") || "(root)";
    if (issue.code === "unrecognized_keys") {
      lines.push(`${path}: unexpected key(s) not in schema: ${(issue.keys ?? []).join(", ")}`);
    } else if (issue.code === "invalid_union" && issue.errors) {
      const branches = issue.errors.map((branch) => formatIssues(branch, path).join(" & "));
      lines.push(`${path}: matched no union branch [${branches.join(" | ")}]`);
    } else if (issue.code === "invalid_type") {
      lines.push(`${path}: expected ${issue.expected ?? "?"} (${issue.message})`);
    } else {
      lines.push(`${path}: ${issue.message} (${issue.code})`);
    }
  }
  return lines;
}

// `countrySchema` is the single source of truth for the `Country` type, so
// validating EVERY country (with all properties) against it guarantees our
// types match the live v5 API. `strictObject` also fails on any field the API
// returns that we don't model — surfacing schema drift.
test("every country in the API conforms to the Country schema", async () => {
  const countries = await loadAllCountries();
  expect(countries.length).toBeGreaterThan(200);

  const failures: string[] = [];
  for (const country of countries) {
    const result = countrySchema.safeParse(country);
    if (!result.success) {
      const name = country.names?.common ?? country.codes?.alpha_3 ?? "unknown";
      failures.push(`${name}: ${formatIssues(result.error.issues).join("; ")}`);
    }
  }

  if (failures.length) {
    throw new Error(`${failures.length}/${countries.length} countries failed schema validation:\n${failures.join("\n")}`);
  }
}, 30_000);
