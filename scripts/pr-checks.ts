#!/usr/bin/env node
// PR Checks script
// Run this before opening a PR:
//   pnpm checks
//
import { execSync } from "child_process";
import * as readline from "readline";

interface Check {
  name: string;
  cmd: string;
  onFail?: string;
}

// ── Colors ────────────────────────────────────────────────────────
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

// ── Prompt helper ─────────────────────────────────────────────────
function ask(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() !== "n");
    });
  });
}

// ── Checks (same order as CI) ─────────────────────────────────────
const checks: Check[] = [
  {
    name: "Prettier — format check",
    cmd: "pnpm prettier --check .",
    onFail: "pnpm prettier --write .",
  },
  {
    name: "TypeScript — type check",
    cmd: "pnpm tsc --noEmit",
  },
  {
    name: "tsdown — check for build errors",
    cmd: "pnpm build",
  },
];

// ── Runner ────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}${CYAN}   PR Checks — @yusifaliyevpro/countries${RESET}`);
console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}\n`);

for (const check of checks) {
  console.log(`${BOLD}${YELLOW}▶ ${check.name}${RESET}`);
  console.log(`  ${CYAN}$ ${check.cmd}${RESET}\n`);

  let errorOutput = "";

  try {
    // Buffer stderr so it doesn't race with our prompt
    const result = execSync(check.cmd, {
      encoding: "utf8",
      stdio: ["inherit", "inherit", "pipe"],
    });
    if (result) process.stdout.write(result);
    console.log(`\n${GREEN}✔ PASSED: ${check.name}${RESET}\n`);
    passed++;
  } catch (err: unknown) {
    // Collect stderr output, print it cleanly before prompt
    if (err && typeof err === "object" && "stderr" in err) {
      errorOutput = String((err as { stderr: string }).stderr ?? "");
    }
    if (errorOutput) process.stderr.write(errorOutput);

    console.log(`\n${RED}✖ FAILED: ${check.name}${RESET}`);

    if (check.onFail) {
      console.log(`\n${YELLOW}  Some files are not formatted correctly.${RESET}`);

      // Ask after all output is flushed
      const confirm = await ask(`${YELLOW}${BOLD}  Run "${check.onFail}" to auto-fix? [Enter = yes / n = skip]: ${RESET}`);

      if (confirm) {
        try {
          console.log(`\n  ${CYAN}$ ${check.onFail}${RESET}\n`);
          execSync(check.onFail, { stdio: "inherit" });
          console.log(`\n${GREEN}✔ Auto-fixed: ${check.name}${RESET}\n`);
          passed++;
          console.log(`${CYAN}──────────────────────────────────────────────────${RESET}\n`);
          continue;
        } catch {
          console.log(`\n${RED}  Auto-fix failed. Please fix manually.${RESET}`);
        }
      } else {
        console.log(`${YELLOW}  Skipped auto-fix.${RESET}`);
      }
    }

    console.log();
    failed++;
    failures.push(check.name);
  }

  console.log(`${CYAN}──────────────────────────────────────────────────${RESET}\n`);
}

// ── Summary ───────────────────────────────────────────────────────
console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}   Results: ${GREEN}${passed} passed${RESET}${BOLD}, ${failed > 0 ? RED : GREEN}${failed} failed${RESET}`);

if (failures.length > 0) {
  console.log(`\n${RED}${BOLD}Failed checks:${RESET}`);
  failures.forEach((name) => console.log(`  ${RED}• ${name}${RESET}`));
  console.log(`\n${RED}${BOLD}⚠  Fix the issues above before opening a PR.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}${BOLD}✔  All checks passed. Ready to open a PR!${RESET}\n`);
  process.exit(0);
}
