import type { Country } from "@yusifaliyevpro/countries";
import { countrySchema } from "@yusifaliyevpro/countries";
import type { $ZodIssue } from "zod/v4/core";
import { loadAllCountries } from "./all-countries";

/** Resolve the value that actually lives at `path` inside the parsed country. */
function valueAtPath(root: unknown, path: PropertyKey[]): unknown {
  return path.reduce<unknown>((acc, key) => (acc === null ? undefined : (acc as Record<PropertyKey, unknown>)[key]), root);
}

/** A short, human-readable preview of a received value — its shape, not its full contents. */
function preview(value: unknown): string {
  if (value === undefined) return "missing";
  if (value === null) return "null";
  if (Array.isArray(value)) {
    const sample = value.length ? preview(value[0]) : "";
    return `array(${value.length})${value.length ? ` of ${sample}` : ""}`;
  }
  if (typeof value === "object") return `object{ ${Object.keys(value as object).join(", ")} }`;
  if (typeof value === "string") return `string ${JSON.stringify(value.length > 40 ? `${value.slice(0, 40)}…` : value)}`;
  return `${typeof value}(${String(value)})`;
}

/**
 * Turn Zod issues into an indented, readable tree. Each line shows the path,
 * what the schema wanted, and — crucially — what the API actually sent.
 */
function formatIssues(root: unknown, issues: $ZodIssue[], indent = "  "): string[] {
  const lines: string[] = [];
  for (const issue of issues) {
    const path = issue.path.map(String).join(".") || "(root)";
    const got = preview(valueAtPath(root, issue.path));

    if (issue.code === "unrecognized_keys") {
      lines.push(`${indent}${path}: extra key(s) the schema doesn't allow → ${(issue.keys ?? []).join(", ")}`);
    } else if (issue.code === "invalid_type") {
      lines.push(`${indent}${path}: expected ${issue.expected ?? "?"}, got ${got}`);
    } else if (issue.code === "invalid_union" && issue.errors) {
      lines.push(`${indent}${path}: value matched none of the ${issue.errors.length} allowed shapes — got ${got}`);
      issue.errors.forEach((branch, i) => {
        lines.push(`${indent}  option ${i + 1} wanted:`);
        lines.push(...formatIssues(root, branch, `${indent}    `));
      });
    } else {
      lines.push(`${indent}${path}: ${issue.message} (${issue.code}) — got ${got}`);
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

  // The runtime half of that guarantee is the parse loop below; this is the
  // static half — if the schema and the exported `Country` ever drift apart,
  // every parse could still pass while consumers get the wrong type.
  expectTypeOf<ReturnType<typeof countrySchema.parse>>().toExtend<Country>();
  expectTypeOf(countries).toEqualTypeOf<Country[]>();

  expect(countries.length).toBeGreaterThan(200);

  const failures: string[] = [];
  for (const country of countries) {
    const result = countrySchema.safeParse(country);
    if (!result.success) {
      const name = country.names?.common ?? country.codes?.alpha_3 ?? "unknown";
      failures.push([name, ...formatIssues(country, result.error.issues)].join("\n"));
    }
  }

  if (failures.length) {
    throw new Error(`${failures.length}/${countries.length} countries failed schema validation:\n\n${failures.join("\n\n")}`);
  }
}, 30_000);
