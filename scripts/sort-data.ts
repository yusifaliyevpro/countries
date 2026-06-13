// Sorts every `export const X = [...] as const;` array in src/data/ alphabetically.
// Run after adding entries so they land in the right place:  node scripts/sort-data.ts
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const dir = resolve("src/data");
// Matches each `export const NAME = [ ...items... ] as const;` block (multiple per file allowed).
const BLOCK = /export const (\w+)\s*=\s*\[([\s\S]*?)\]\s*as const;/g;
// A single quoted string item (handles escaped quotes/backslashes).
const ITEM = /"((?:[^"\\]|\\.)*)"/g;

let changedAny = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
  const path = join(dir, file);
  const original = readFileSync(path, "utf8");
  let fileChanged = false;

  const updated = original.replace(BLOCK, (block: string, name: string, body: string) => {
    const items = [...body.matchAll(ITEM)].map((m) => m[1]);
    if (items.length === 0) return block;

    const sorted = [...items].sort((a, b) => a.localeCompare(b, "en"));
    if (sorted.every((value, i) => value === items[i])) return block; // already sorted

    fileChanged = true;
    const literal = `[\n${sorted.map((value) => `  "${value}",`).join("\n")}\n]`;
    return `export const ${name} = ${literal} as const;`;
  });

  if (fileChanged) {
    writeFileSync(path, updated);
    changedAny = true;
    console.log(`sorted  ${file}`);
  } else {
    console.log(`ok      ${file}`);
  }
}

if (changedAny) console.log("\nRun `prettier --write src/data` to normalize formatting.");
