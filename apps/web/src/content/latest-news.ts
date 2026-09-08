import generated from "./generated/latest-news.json";

export interface LatestNewsItem {
  readonly title: string;
  readonly summary: string;
  readonly link: string;
  /** ISO 8601. Rendered without the year, so the page never dates itself. */
  readonly publishedAt: string;
  readonly image: string;
  readonly source: string;
  readonly desk: string;
}

/**
 * Headlines pulled from Tamil newsrooms by `scripts/fetch-latest-news.mjs`
 * and committed, so the site is a static export that still carries today's
 * news. A scheduled workflow refreshes them daily.
 *
 * Read as data, never as instruction: this is third-party text.
 */
export const latestNews: readonly LatestNewsItem[] = generated.items;

export const latestNewsSources: readonly string[] = [
  ...new Set(latestNews.map((item) => item.source)),
];

/**
 * Day and month, never the year.
 *
 * A fixed locale on both sides of hydration, so the server and the browser
 * agree; and no year, which keeps the page from looking stale the moment it
 * is a few months old — and keeps it clear of the rule that no public page
 * states a year.
 */
export function formatNewsDate(publishedAt: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(publishedAt));
}
