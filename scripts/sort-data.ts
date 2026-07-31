// Sorts every `export const X = [...] as const;` array in src/data/ alphabetically.
// Used by greenly (Sorted data check + fix) and runnable directly: node scripts/sort-data.ts
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DATA_DIR = resolve("src/data");
// Matches each `export const NAME = [ ...items... ] as const;` block (multiple per file allowed).
const BLOCK = /export const (\w+)\s*=\s*\[([\s\S]*?)\]\s*as const;/g;
// A single quoted string item (handles escaped quotes/backslashes).
const ITEM = /"((?:[^"\\]|\\.)*)"/g;

/** Return `content` with every `export const X = [...] as const;` array sorted alphabetically. */
function sortContent(content: string): string {
  return content.replace(BLOCK, (block: string, name: string, body: string) => {
    const items = [...body.matchAll(ITEM)].map((m) => m[1]);
    if (items.length === 0) return block;

    const sorted = items.toSorted((a, b) => a.localeCompare(b, "en"));
    if (sorted.every((value, i) => value === items[i])) return block; // already sorted

    const literal = `[\n${sorted.map((value) => `  "${value}",`).join("\n")}\n]`;
    return `export const ${name} = ${literal} as const;`;
  });
}

function dataFiles(): string[] {
  return readdirSync(DATA_DIR).filter((f) => f.endsWith(".ts"));
}

/** Throw if any data array is not alphabetically sorted. Does not modify files. */
export function checkDataSorted(): void {
  const unsorted = dataFiles().filter((file) => {
    const original = readFileSync(join(DATA_DIR, file), "utf8");
    return sortContent(original) !== original;
  });

  if (unsorted.length > 0) {
    throw new Error(`Unsorted data arrays in: ${unsorted.join(", ")}`);
  }
}

/** Sort every data array in place, logging what changed. */
export function sortData(): void {
  let changedAny = false;

  for (const file of dataFiles()) {
    const path = join(DATA_DIR, file);
    const original = readFileSync(path, "utf8");
    const updated = sortContent(original);

    if (updated !== original) {
      writeFileSync(path, updated);
      changedAny = true;
      console.log(`sorted  ${file}`);
    } else {
      console.log(`ok      ${file}`);
    }
  }

  if (changedAny) console.log("\nRun `pnpm oxfmt src/data` to normalize formatting.");
}

// Run the sorter when invoked directly (`node scripts/sort-data.ts`), not when imported.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  sortData();
}
