// Verifies the Turbo cache guard against small, temporary fixture data —
// never against real gigabyte-scale cache. Uses Node's built-in test
// runner (no new dependency): `node --test scripts/maintenance` or
// `pnpm cache:test`.
import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  utimesSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  deleteEntries,
  formatBytes,
  guardCache,
  readCacheEntries,
  selectEntriesToPrune,
  totalSize,
} from "./prune-dev-cache.mjs";

let tmpDir;
let cacheDir;

beforeEach(() => {
  tmpDir = mkdtempSync(path.join(os.tmpdir(), "turbo-cache-guard-test-"));
  cacheDir = path.join(tmpDir, ".turbo", "cache");
  mkdirSync(cacheDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

/** Writes one fake cache entry (tar + manifest + meta, matching Turbo's
 * real on-disk shape) of the given size, with a given age relative to
 * now so entries can be ordered oldest-to-newest deterministically. */
function writeFakeEntry(hash, sizeBytes, ageSeconds) {
  const tarPath = path.join(cacheDir, `${hash}.tar.zst`);
  writeFileSync(tarPath, Buffer.alloc(sizeBytes, 1));
  writeFileSync(path.join(cacheDir, `${hash}-manifest.json`), "[]");
  writeFileSync(path.join(cacheDir, `${hash}-meta.json`), "{}");
  const when = new Date(Date.now() - ageSeconds * 1000);
  for (const suffix of [".tar.zst", "-manifest.json", "-meta.json"]) {
    utimesSync(path.join(cacheDir, `${hash}${suffix}`), when, when);
  }
}

describe("readCacheEntries / totalSize", () => {
  it("groups a hash's three files into one entry and sums their size", () => {
    writeFakeEntry("aaa", 1000, 10);
    const entries = readCacheEntries(cacheDir);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].hash, "aaa");
    assert.equal(entries[0].files.length, 3);
    // 1000 (tar) + 2 ("[]") + 2 ("{}") = 1004
    assert.equal(entries[0].totalBytes, 1004);
  });

  it("returns an empty array when the cache directory does not exist yet", () => {
    const missing = path.join(tmpDir, "does-not-exist");
    assert.deepEqual(readCacheEntries(missing), []);
    assert.equal(totalSize(readCacheEntries(missing)), 0);
  });
});

describe("selectEntriesToPrune", () => {
  it("D. picks the oldest entries first and stops as soon as the target is met, leaving recent entries untouched", () => {
    writeFakeEntry("oldest", 100, 300);
    writeFakeEntry("middle", 100, 200);
    writeFakeEntry("newest", 100, 10);
    const entries = readCacheEntries(cacheDir);

    // Target requires freeing just over 100 bytes — only the single
    // oldest entry should be selected.
    const toPrune = selectEntriesToPrune(entries, 220);
    assert.equal(toPrune.length, 1);
    assert.equal(toPrune[0].hash, "oldest");
  });

  it("selects multiple oldest entries when one is not enough to reach the target", () => {
    // Each entry is 104 bytes on disk (100-byte tar + 2-byte manifest +
    // 2-byte meta), so 312 total. A target of 150 requires removing both
    // "oldest" and "middle" (down to 104) — "newest" alone (208) would
    // still exceed it.
    writeFakeEntry("oldest", 100, 300);
    writeFakeEntry("middle", 100, 200);
    writeFakeEntry("newest", 100, 10);
    const entries = readCacheEntries(cacheDir);

    const toPrune = selectEntriesToPrune(entries, 150);
    const hashes = toPrune.map((e) => e.hash).sort();
    assert.deepEqual(hashes, ["middle", "oldest"]);
  });
});

describe("guardCache", () => {
  it("A. below the warning threshold: does nothing and logs nothing", () => {
    writeFakeEntry("small", 100, 10);
    const logs = [];
    const result = guardCache({
      cacheDir,
      warnBytes: 10_000,
      hardBytes: 20_000,
      targetBytes: 5_000,
      log: (m) => logs.push(m),
    });
    assert.equal(result.action, "none");
    assert.equal(logs.length, 0);
    // Nothing was deleted.
    assert.equal(readCacheEntries(cacheDir).length, 1);
  });

  it("B. in the warning range: logs a warning, deletes nothing", () => {
    writeFakeEntry("mid", 15_000, 10);
    const logs = [];
    const result = guardCache({
      cacheDir,
      warnBytes: 10_000,
      hardBytes: 20_000,
      targetBytes: 5_000,
      log: (m) => logs.push(m),
    });
    assert.equal(result.action, "warn");
    assert.equal(logs.length, 1);
    assert.match(logs[0], /automatic pruning will occur/);
    assert.equal(readCacheEntries(cacheDir).length, 1);
  });

  it("C. above the hard threshold: prunes down toward the target", () => {
    writeFakeEntry("old-1", 10_000, 300);
    writeFakeEntry("old-2", 10_000, 200);
    writeFakeEntry("recent", 10_000, 10);
    const logs = [];
    const result = guardCache({
      cacheDir,
      warnBytes: 10_000,
      hardBytes: 25_000,
      targetBytes: 12_000,
      log: (m) => logs.push(m),
    });
    assert.equal(result.action, "prune");
    assert.equal(logs.length, 1);
    assert.match(logs[0], /exceeded/);

    const remaining = readCacheEntries(cacheDir);
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].hash, "recent");
  });

  it("D. recent entries survive selective pruning even when older ones are removed", () => {
    writeFakeEntry("ancient", 5_000, 400);
    writeFakeEntry("old", 5_000, 300);
    writeFakeEntry("recent", 5_000, 10);
    guardCache({
      cacheDir,
      warnBytes: 1_000,
      hardBytes: 10_000,
      targetBytes: 6_000,
      log: () => {},
    });
    const remainingHashes = readCacheEntries(cacheDir)
      .map((e) => e.hash)
      .sort();
    assert.deepEqual(remainingHashes, ["recent"]);
  });

  it("E. never touches files outside the cache directory", () => {
    writeFakeEntry("old", 50_000, 300);
    writeFakeEntry("recent", 50_000, 10);
    const sentinelDir = path.join(tmpDir, "node_modules");
    mkdirSync(sentinelDir, { recursive: true });
    const sentinelFile = path.join(sentinelDir, "definitely-keep-me.txt");
    writeFileSync(sentinelFile, "do not touch");
    const siblingLogFile = path.join(
      cacheDir,
      "..",
      "..",
      "not-a-cache-file.txt",
    );
    writeFileSync(siblingLogFile, "also do not touch");

    guardCache({
      cacheDir,
      warnBytes: 10_000,
      hardBytes: 20_000,
      targetBytes: 5_000,
      log: () => {},
    });

    assert.equal(
      existsSync(sentinelFile),
      true,
      "a file outside the cache directory must never be deleted",
    );
    assert.equal(
      existsSync(siblingLogFile),
      true,
      "a file outside the cache directory must never be deleted",
    );
    // The recent cache entry itself may or may not remain depending on the
    // exact target — what matters here is only that nothing outside
    // cacheDir was ever touched, asserted above.
  });

  it("F. repeated invocation is idempotent — a second run after pruning is a safe no-op", () => {
    writeFakeEntry("old", 10_000, 300);
    writeFakeEntry("recent", 10_000, 10);
    const config = {
      cacheDir,
      warnBytes: 5_000,
      hardBytes: 15_000,
      targetBytes: 8_000,
    };
    const first = guardCache({ ...config, log: () => {} });
    assert.equal(first.action, "prune");

    const second = guardCache({ ...config, log: () => {} });
    // Nothing left to prune below the (now already-under) target, and it
    // must not throw or attempt to re-delete already-removed files.
    assert.equal(second.action, "none");
    assert.equal(second.beforeBytes, second.afterBytes);

    const third = guardCache({ ...config, force: true, log: () => {} });
    assert.equal(third.action, "already-under-target");
  });

  it("--force prunes toward the target even when under the warning threshold", () => {
    writeFakeEntry("old", 5_000, 300);
    writeFakeEntry("recent", 5_000, 10);
    const logs = [];
    const result = guardCache({
      cacheDir,
      warnBytes: 100_000, // absurdly high — would never warn/prune unforced
      hardBytes: 200_000,
      targetBytes: 6_000,
      force: true,
      log: (m) => logs.push(m),
    });
    assert.equal(result.action, "prune");
    assert.deepEqual(
      readCacheEntries(cacheDir).map((e) => e.hash),
      ["recent"],
    );
  });
});

describe("formatBytes", () => {
  it("formats bytes, KB, MB, GB with one decimal place above 1 KB", () => {
    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(1536), "1.5 KB");
    assert.equal(formatBytes(3 * 1024 ** 3), "3.0 GB");
  });
});

describe("deleteEntries", () => {
  it("is safe to call twice on the same entries (idempotent deletion)", () => {
    writeFakeEntry("dup", 100, 10);
    const entries = readCacheEntries(cacheDir);
    assert.doesNotThrow(() => {
      deleteEntries(entries);
      deleteEntries(entries); // files already gone — must not throw
    });
    assert.equal(readCacheEntries(cacheDir).length, 0);
  });
});
