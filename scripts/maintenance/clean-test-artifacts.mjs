#!/usr/bin/env node
/**
 * Deliberate, manual cleanup of reproducible QA/test output. Never run
 * automatically (no test/build script calls this) — deleting these mid-run
 * would destroy output someone is actively looking at. Invoke by hand:
 *
 *   pnpm clean:test-artifacts
 *
 * Each target is emptied, not removed, so the directory stays available
 * for whatever writes into it next (Playwright, Vitest coverage, or an
 * ad-hoc visual-QA script) without needing to be recreated.
 *
 * Scope is exactly these four generated directories — nothing else.
 */
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

const TARGETS = [
  "apps/web/playwright-report",
  "apps/web/test-results",
  "apps/web/coverage",
  "artifacts",
];

for (const relativePath of TARGETS) {
  const dir = path.join(REPO_ROOT, relativePath);
  if (!existsSync(dir)) continue;
  const entries = readdirSync(dir);
  for (const name of entries) {
    rmSync(path.join(dir, name), { recursive: true, force: true });
  }
  console.log(
    `Cleared ${relativePath} (${entries.length} item${entries.length === 1 ? "" : "s"})`,
  );
}
