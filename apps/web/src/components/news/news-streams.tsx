import { Container, ImageWithFallback, Section } from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { newsContent } from "@/content/news";

/**
 * The newsroom, grouped by what a piece is rather than when it ran.
 *
 * A dated feed is out of date the moment nothing is posted for a week.
 * Three standing streams stay true, and each one says plainly what it
 * carries — which is also the shape a `news` table would take.
 */
export function NewsStreams() {
  return (
    <Section tone="ivory" aria-labelledby="news-streams-title">
      <Container size="wide">
        <div data-motion-reveal="" className="max-w-3xl">
          <p className="text-fg-accent text-eyebrow">THREE DESKS</p>
          <h2
            id="news-streams-title"
            className="text-gradient-ink mt-3 text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-5xl"
          >
            What the newsroom carries.
          </h2>
        </div>

        {/* A list, not articles. <article> means a self-contained composition,
            and a card describing a desk is not one — the suite checks that
            /news publishes no articles precisely so the page cannot imply it
            carries stories it does not have. */}
        <ul
          data-motion-group="stagger"
          className="mt-9 grid gap-5 lg:grid-cols-3"
        >
          {newsContent.streams.map((stream, index) => (
            <li
              key={stream.slug}
              className="stream-card group border-hairline/12 rounded-card relative isolate flex flex-col overflow-hidden border"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  asset={images[stream.imageKey]}
                  fallbackLabel={stream.title}
                  sizes="(min-width: 64rem) 33vw, 100vw"
                  className="stream-card-image h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="event-card-scrim absolute inset-0"
                />
                <span className="stream-card-index absolute top-4 left-4">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="relative flex flex-1 flex-col p-5 sm:p-6">
                <p
                  className="font-tamil text-gradient-gold text-base leading-snug"
                  lang="ta"
                >
                  {stream.tamilTitle}
                </p>
                <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-white">
                  {stream.title}
                </h3>
                <p className="mt-2 leading-7 text-white/70">
                  {stream.description}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {stream.topics.map((topic) => (
                    <li
                      key={topic}
                      className="border-hairline text-fg-body rounded-full border px-3 py-1 text-xs font-semibold"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
                <span
                  aria-hidden="true"
                  className="event-card-rule mt-auto block h-px w-full pt-5"
                />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
