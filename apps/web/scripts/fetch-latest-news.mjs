#!/usr/bin/env node
/**
 * Pulls the latest Tamil headlines into the repository.
 *
 * The site is a static export, so there is nothing at runtime that could go
 * and fetch a feed. This runs before a build, writes what it finds to
 * `src/content/generated/latest-news.json`, and that file is committed — so a
 * build never depends on three third-party servers being up, and a feed going
 * down costs us yesterday's headlines rather than an empty page.
 *
 * A daily workflow re-runs it and redeploys.
 *
 * What we take is what a feed is published for: a headline, a couple of lines,
 * the source's name, and a link back to it. Never the article. Anyone who
 * wants to read the piece goes to the publication that wrote it.
 *
 *   node scripts/fetch-latest-news.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(here, "../src/content/generated/latest-news.json");

const FEEDS = [
  {
    source: "BBC Tamil",
    url: "https://feeds.bbci.co.uk/tamil/rss.xml",
    desk: "world",
  },
  {
    source: "News18 Tamil",
    url: "https://tamil.news18.com/commonfeeds/v1/tam/rss/tamil-nadu.xml",
    desk: "tamil-nadu",
  },
  {
    source: "OneIndia Tamil",
    url: "https://tamil.oneindia.com/rss/tamil-news-fb.xml",
    desk: "tamil-nadu",
  },
  {
    source: "Tamil Guardian",
    url: "https://www.tamilguardian.com/rss.xml",
    desk: "diaspora",
  },
];

const WANTED = 12;
const TIMEOUT_MS = 15_000;

/** Pulls one tag's text, unwrapping CDATA and decoding the few entities that
 *  actually turn up in these feeds. */
function tagText(xml, tag) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(xml);
  if (!match?.[1]) return "";
  return (
    match[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      // OneIndia ships literal backslash-escaped quotes inside its titles —
      // not entities, actual \" characters that would otherwise render.
      .replace(/\\(["'])/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** BBC hangs a thumbnail off media:thumbnail; others use enclosure. Either
 *  way we want the URL, and we want it https. */
function imageFrom(xml) {
  const media = /<media:thumbnail[^>]*url="([^"]+)"/.exec(xml);
  const enclosure = /<enclosure[^>]*url="([^"]+)"[^>]*type="image/.exec(xml);
  const url = media?.[1] ?? enclosure?.[1] ?? "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function trim(text, limit) {
  if (text.length <= limit) return text;
  // Tamil has no spaces at every word boundary the way English does, so fall
  // back to a hard cut when there is no space to break on.
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

async function readFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(feed.url, {
      signal: controller.signal,
      // Several Tamil publishers refuse a bot user-agent outright — OneIndia
      // answers 403 to anything that does not look like a browser.
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
        accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();

    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map(([, item]) => {
        const title = tagText(item, "title");
        const link = tagText(item, "link");
        const published = tagText(item, "pubDate");
        const date = new Date(published);
        if (!title || !link || Number.isNaN(date.getTime())) return null;
        return {
          title: trim(title, 130),
          summary: trim(tagText(item, "description"), 180),
          link,
          publishedAt: date.toISOString(),
          image: imageFrom(item),
          source: feed.source,
          desk: feed.desk,
        };
      })
      .filter((item) => item !== null);
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const settled = await Promise.allSettled(FEEDS.map(readFeed));

  const items = [];
  for (const [index, result] of settled.entries()) {
    const feed = FEEDS[index];
    if (result.status === "fulfilled") {
      items.push(...result.value);
      process.stdout.write(`  ${feed.source}: ${result.value.length} items\n`);
    } else {
      process.stdout.write(`  ${feed.source}: FAILED — ${result.reason}\n`);
    }
  }

  if (items.length === 0) {
    // Every feed failed. Keep whatever is committed rather than publishing an
    // empty newsroom.
    process.stdout.write("no items fetched; leaving the existing file\n");
    return;
  }

  const seen = new Set();
  const byRecency = items
    .filter((item) => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  // News18 publishes far more often than the others, so straight recency
  // would hand it the whole page. Take a fair share from each source first,
  // then fill the remainder with whatever is most recent.
  const perSource = Math.ceil(WANTED / FEEDS.length);
  const counts = new Map();
  const latest = [];
  for (const item of byRecency) {
    const taken = counts.get(item.source) ?? 0;
    if (taken >= perSource) continue;
    counts.set(item.source, taken + 1);
    latest.push(item);
  }
  for (const item of byRecency) {
    if (latest.length >= WANTED) break;
    if (!latest.includes(item)) latest.push(item);
  }
  latest.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  latest.length = Math.min(latest.length, WANTED);

  const payload = {
    fetchedAt: new Date().toISOString(),
    items: latest,
  };

  await mkdir(dirname(outputPath), { recursive: true });

  const next = `${JSON.stringify(payload, null, 2)}\n`;
  const previous = await readFile(outputPath, "utf8").catch(() => "");
  // Compare on the items alone: fetchedAt changes every run and would make
  // every scheduled build look like it had something new to say.
  const sameItems =
    previous &&
    JSON.stringify(JSON.parse(previous).items) === JSON.stringify(latest);
  if (sameItems) {
    process.stdout.write(`no change (${latest.length} items)\n`);
    return;
  }

  await writeFile(outputPath, next, "utf8");
  process.stdout.write(`wrote ${latest.length} items to ${outputPath}\n`);
}

await main();
