#!/usr/bin/env node
/**
 * Guards the local Turbo cache (`.turbo/cache`) against unbounded growth.
 *
 * Turbo's local cache has no built-in size limit or eviction — confirmed
 * against the installed CLI (2.10.7): `turbo --help` exposes only remote-
 * cache and cache-read/write-behavior flags (`--cache`, `--cache-dir`,
 * `--remote-cache-*`), and `turbo.json`'s task schema has no size/TTL/
 * eviction field. Left alone, `.turbo/cache` grows forever: every distinct
 * `build`/`test`/`lint`/`typecheck` invocation writes a new, never-expired
 * entry. This repository's own cache reached ~92 GB this way before being
 * manually cleared — this script exists so that cannot silently happen
 * again.
 *
 * Policy (bytes, not blocks — see formatBytes):
 *   < warn threshold   -> do nothing, print nothing.
 *   >= warn threshold, < hard threshold -> print one warning line, delete
 *                                          nothing.
 *   >= hard threshold  -> delete the OLDEST cache entries (by file mtime)
 *                         until the cache is back at or below the prune
 *                         target, keeping the most recently used entries.
 *
 * A cache "entry" is one Turbo task hash: its `<hash>.tar.zst` archive,
 * `<hash>-manifest.json`, and `<hash>-meta.json` are always grouped and
 * deleted together as one unit — never a partial entry.
 *
 * Scope is strictly the Turbo cache directory. This script never touches
 * node_modules, .git, source files, environment files, Supabase or Docker
 * data, or any other user asset, and it never deletes the cache directory
 * itself outright — only the individual old entries needed to reach the
 * target.
 *
 * CLI usage (see package.json's cache:check / cache:prune scripts, and the
 * unguarded invocation prepended to build/lint/typecheck/test):
 *   node scripts/maintenance/prune-dev-cache.mjs            guard mode — quiet unless over the warning threshold
 *   node scripts/maintenance/prune-dev-cache.mjs --check     report only, never deletes anything
 *   node scripts/maintenance/prune-dev-cache.mjs --force     always prune down to the target, regardless of current size
 *
 * The cache directory and every threshold are overridable via environment
 * variables so the test suite (prune-dev-cache.test.mjs) can exercise this
 * against small, temporary fixture directories instead of gigabytes of
 * real cache data:
 *   TURBO_CACHE_DIR
 *   TURBO_CACHE_WARN_BYTES
 *   TURBO_CACHE_HARD_BYTES
 *   TURBO_CACHE_TARGET_BYTES
 */
import { existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, "../..");
export const DEFAULT_CACHE_DIR = path.join(REPO_ROOT, ".turbo", "cache");
export const DEFAULT_WARN_BYTES = 3 * 1024 ** 3; // 3 GB
export const DEFAULT_HARD_BYTES = 5 * 1024 ** 3; // 5 GB
export const DEFAULT_TARGET_BYTES = 2 * 1024 ** 3; // 2 GB

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Groups every file directly inside the cache directory by its task hash
 * (the filename with the `.tar.zst`, `-manifest.json`, or `-meta.json`
 * suffix removed) and returns one entry per hash: its constituent file
 * paths, their combined size in bytes, and the newest mtime among them.
 *
 * mtime, not atime, is the recency signal: atime tracking is disabled or
 * unreliable by default on many filesystems and mount options (macOS APFS
 * and most Linux setups included), so it cannot be trusted as a
 * deterministic ordering; mtime is stable, portable, and is what every
 * file already has to report.
 *
 * Not recursive — the cache directory is a flat directory of files, so a
 * single `readdirSync` plus one `statSync` per entry is the entire cost.
 * No full filesystem traversal is ever performed by this script.
 */
export function readCacheEntries(cacheDir) {
  if (!existsSync(cacheDir)) return [];
  const byHash = new Map();
  for (const name of readdirSync(cacheDir)) {
    const filePath = path.join(cacheDir, name);
    let stats;
    try {
      stats = statSync(filePath);
    } catch {
      continue; // vanished between readdir and stat (e.g. a concurrent turbo run) — not this script's concern
    }
    if (!stats.isFile()) continue;
    const hash = name
      .replace(/\.tar\.zst$/, "")
      .replace(/-manifest\.json$/, "")
      .replace(/-meta\.json$/, "");
    const entry = byHash.get(hash) ?? {
      hash,
      files: [],
      totalBytes: 0,
      newestMtimeMs: 0,
    };
    entry.files.push(filePath);
    entry.totalBytes += stats.size;
    entry.newestMtimeMs = Math.max(entry.newestMtimeMs, stats.mtimeMs);
    byHash.set(hash, entry);
  }
  return [...byHash.values()];
}

export function totalSize(entries) {
  return entries.reduce((sum, entry) => sum + entry.totalBytes, 0);
}

/**
 * Oldest-first (by newestMtimeMs), selects the smallest set of entries
 * whose removal brings the total at or below targetBytes. Recent entries
 * are never selected while older ones remain. If every entry were
 * selected and the target still could not be reached, that is still a
 * safe outcome — the empty cache directory itself is left in place, and
 * Turbo simply treats the next run as a full cache miss.
 */
export function selectEntriesToPrune(entries, targetBytes) {
  const sorted = [...entries].sort((a, b) => a.newestMtimeMs - b.newestMtimeMs);
  let running = totalSize(entries);
  const toPrune = [];
  for (const entry of sorted) {
    if (running <= targetBytes) break;
    toPrune.push(entry);
    running -= entry.totalBytes;
  }
  return toPrune;
}

export function deleteEntries(entries) {
  for (const entry of entries) {
    for (const file of entry.files) {
      try {
        unlinkSync(file);
      } catch {
        // Already gone — deleting is idempotent, this is not an error.
      }
    }
  }
}

/**
 * The core guard, deliberately free of any process.argv/console reading —
 * every input is a parameter, so it is directly unit-testable against a
 * temporary directory and tiny thresholds.
 */
export function guardCache({
  cacheDir,
  warnBytes,
  hardBytes,
  targetBytes,
  force = false,
  log = () => {},
}) {
  const before = readCacheEntries(cacheDir);
  const beforeBytes = totalSize(before);

  if (!force) {
    if (beforeBytes < warnBytes) {
      return {
        action: "none",
        beforeBytes,
        afterBytes: beforeBytes,
        prunedEntries: [],
      };
    }
    if (beforeBytes < hardBytes) {
      log(
        `Turbo cache: ${formatBytes(beforeBytes)} — automatic pruning will occur at ${formatBytes(hardBytes)}.`,
      );
      return {
        action: "warn",
        beforeBytes,
        afterBytes: beforeBytes,
        prunedEntries: [],
      };
    }
  }

  const toPrune = selectEntriesToPrune(before, targetBytes);
  const prunedBytes = toPrune.reduce((sum, entry) => sum + entry.totalBytes, 0);
  const afterBytes = beforeBytes - prunedBytes;

  if (toPrune.length === 0) {
    if (force) {
      log(
        `Turbo cache: ${formatBytes(beforeBytes)} — already at or below the target (${formatBytes(targetBytes)}); nothing to prune.`,
      );
    }
    return {
      action: force ? "already-under-target" : "none",
      beforeBytes,
      afterBytes,
      prunedEntries: [],
    };
  }

  deleteEntries(toPrune);
  log(
    `Turbo cache: ${formatBytes(beforeBytes)} exceeded ${formatBytes(hardBytes)} — pruned ${toPrune.length} old entr${toPrune.length === 1 ? "y" : "ies"}, now ${formatBytes(afterBytes)} (reclaimed ${formatBytes(prunedBytes)}).`,
  );
  return { action: "prune", beforeBytes, afterBytes, prunedEntries: toPrune };
}

function resolveConfig() {
  return {
    cacheDir: process.env.TURBO_CACHE_DIR ?? DEFAULT_CACHE_DIR,
    warnBytes: Number(process.env.TURBO_CACHE_WARN_BYTES ?? DEFAULT_WARN_BYTES),
    hardBytes: Number(process.env.TURBO_CACHE_HARD_BYTES ?? DEFAULT_HARD_BYTES),
    targetBytes: Number(
      process.env.TURBO_CACHE_TARGET_BYTES ?? DEFAULT_TARGET_BYTES,
    ),
  };
}

function runCheck({ cacheDir, warnBytes, hardBytes, targetBytes }) {
  const entries = readCacheEntries(cacheDir);
  const bytes = totalSize(entries);
  console.log(
    `Turbo cache: ${formatBytes(bytes)} across ${entries.length} entr${entries.length === 1 ? "y" : "ies"} (${cacheDir})`,
  );
  console.log(`  warning threshold: ${formatBytes(warnBytes)}`);
  console.log(`  hard threshold:    ${formatBytes(hardBytes)}`);
  console.log(`  prune target:      ${formatBytes(targetBytes)}`);
  if (bytes >= hardBytes) {
    console.log(
      "  status: OVER hard threshold — the next build/test/lint/typecheck will prune automatically, or run `pnpm cache:prune` now.",
    );
  } else if (bytes >= warnBytes) {
    console.log(
      "  status: in warning range — will auto-prune once the hard threshold is reached.",
    );
  } else {
    console.log("  status: healthy — no action needed.");
  }
}

function runCli() {
  const args = process.argv.slice(2);
  const config = resolveConfig();

  if (args.includes("--check")) {
    runCheck(config);
    return;
  }

  guardCache({ ...config, force: args.includes("--force"), log: console.log });
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  runCli();
}
