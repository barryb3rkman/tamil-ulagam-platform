import { Container, Section } from "@tamil-ulagam/ui";

import {
  formatNewsDate,
  latestNews,
  latestNewsSources,
} from "@/content/latest-news";

/**
 * Today's Tamil headlines, from the newsrooms that wrote them.
 *
 * Every card is a headline, a couple of lines, the publication's name and a
 * link out. Nothing here is ours and nothing pretends to be: the article is
 * read where it was published. That is also what makes this the one part of
 * the site that can carry real dates — they are real.
 *
 * Only the BBC feed supplies thumbnails, so the layout has to work with a
 * photograph on some cards and none on others. The first item with an image
 * leads; the rest run as a text-forward list, which is what a newsroom
 * actually looks like.
 */
export function LatestHeadlines() {
  if (latestNews.length === 0) return null;

  const lead = latestNews.find((item) => item.image) ?? latestNews[0];
  if (!lead) return null;
  const rest = latestNews.filter((item) => item !== lead).slice(0, 8);

  return (
    // Marked so the truthfulness checks can tell our own copy from a
    // publisher's. The rule that no page states a year exists to stop the
    // SITE dating itself; a headline that a Tamil newsroom actually printed
    // today, dateline and all, is quoted material and stays as written.
    <Section
      tone="ivory"
      aria-labelledby="latest-headlines-title"
      data-external-headlines=""
    >
      <Container size="wide">
        <div
          data-motion-reveal=""
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div className="max-w-2xl">
            <p className="text-fg-accent text-eyebrow flex items-center gap-2.5">
              <span aria-hidden="true" className="headline-pulse" />
              LATEST
            </p>
            <h2
              id="latest-headlines-title"
              className="text-gradient-ink mt-3 text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-5xl"
            >
              What the Tamil world is reading today.
            </h2>
          </div>
          <p className="text-fg-muted max-w-xs text-sm leading-6">
            Headlines from {latestNewsSources.join(", ")}. Each one opens at the
            newsroom that published it.
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <a
            href={lead.link}
            target="_blank"
            rel="noopener noreferrer"
            className="headline-lead group rounded-card border-hairline/12 focus-visible:ring-focus relative isolate flex flex-col overflow-hidden border focus-visible:outline-none"
          >
            {lead.image ? (
              <div className="relative aspect-[16/9] overflow-hidden">
                {/* A third-party thumbnail, rendered as a plain image: it is
                    not ours to optimise and the domain list should not have to
                    grow every time a feed changes CDN. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lead.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="event-card-image h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="event-card-scrim absolute inset-0"
                />
              </div>
            ) : null}
            <div className="relative p-5 sm:p-6">
              <p className="flex items-center gap-3 text-xs">
                <span className="text-champagne font-bold tracking-[0.14em] uppercase">
                  {lead.source}
                </span>
                <time
                  dateTime={lead.publishedAt}
                  className="text-white/55 tabular-nums"
                >
                  {formatNewsDate(lead.publishedAt)}
                </time>
              </p>
              <h3
                className="font-tamil mt-3 text-2xl leading-[1.5] font-semibold text-white sm:text-3xl"
                lang="ta"
              >
                {lead.title}
              </h3>
              {lead.summary ? (
                <p
                  className="font-tamil mt-3 leading-[1.9] text-white/70"
                  lang="ta"
                >
                  {lead.summary}
                </p>
              ) : null}
              <span
                aria-hidden="true"
                className="event-card-rule mt-5 block h-px w-full"
              />
            </div>
          </a>

          <ul className="grid content-start gap-0">
            {rest.map((item) => (
              <li key={item.link}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="headline-row focus-visible:ring-focus block focus-visible:outline-none"
                >
                  <p className="flex items-center gap-3 text-xs">
                    <span className="text-champagne/85 font-bold tracking-[0.14em] uppercase">
                      {item.source}
                    </span>
                    <time
                      dateTime={item.publishedAt}
                      className="text-fg-muted tabular-nums"
                    >
                      {formatNewsDate(item.publishedAt)}
                    </time>
                  </p>
                  <p
                    className="font-tamil headline-row-title mt-1.5 leading-[1.6] font-semibold"
                    lang="ta"
                  >
                    {item.title}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
