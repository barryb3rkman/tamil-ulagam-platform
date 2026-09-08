import { Container, ImageWithFallback, Section } from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { eventsContent } from "@/content/events";

/**
 * The federation calendar.
 *
 * Six occasions, and the first is given the width of two — a calendar has a
 * first entry and the layout should say so rather than presenting six equal
 * tiles. Every card carries its Tamil name above its English one, which is
 * the thing that makes a page like this read as Tamil rather than as a page
 * about Tamils.
 */
export function SignatureCalendar() {
  const [lead, ...rest] = eventsContent.signature;

  return (
    <Section tone="ivory" aria-labelledby="signature-calendar-title">
      <Container size="wide">
        <div data-motion-reveal="" className="max-w-3xl">
          <p className="text-fg-accent text-eyebrow">THE FEDERATION YEAR</p>
          <h2
            id="signature-calendar-title"
            className="text-gradient-ink mt-3 text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-5xl"
          >
            Six occasions, every chapter, every year.
          </h2>
          <p className="text-fg-muted mt-4 text-lg leading-8">
            The federation fixes the month. Each chapter chooses its own day and
            its own shape.
          </p>
        </div>

        <div
          data-motion-group="stagger"
          className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          <EventCard event={lead} lead />
          {rest.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function EventCard({
  event,
  lead = false,
}: {
  readonly event: (typeof eventsContent.signature)[number];
  readonly lead?: boolean;
}) {
  return (
    <article
      className={`event-card group border-hairline/12 rounded-card relative isolate flex flex-col overflow-hidden border ${
        lead ? "lg:col-span-2" : ""
      }`}
    >
      {/* The lead card sets a tall row, so every other card in that row is
          stretched to match it. Letting the image take the slack turns what
          would be dead space under the copy into more photograph. */}
      <div
        className={`relative flex-1 overflow-hidden ${lead ? "aspect-[16/9] lg:aspect-[21/9]" : "aspect-[16/10] lg:aspect-auto lg:min-h-56"}`}
      >
        <ImageWithFallback
          asset={images[event.imageKey]}
          fallbackLabel={event.title}
          sizes={
            lead
              ? "(min-width: 64rem) 66vw, 100vw"
              : "(min-width: 64rem) 33vw, 100vw"
          }
          className="event-card-image h-full w-full object-cover"
        />
        {/* The scrim is what lets the copy sit on any photograph without
            choosing a text colour per image. */}
        <span
          aria-hidden="true"
          className="event-card-scrim absolute inset-0"
        />
        <span className="event-card-month absolute top-4 left-4">
          {event.month}
        </span>
      </div>

      <div className="relative p-5 sm:p-6">
        <p
          className="font-tamil text-gradient-gold text-lg leading-snug"
          lang="ta"
        >
          {event.tamilTitle}
        </p>
        <h3
          className={`mt-1.5 font-semibold tracking-[-0.02em] text-white ${lead ? "text-3xl sm:text-4xl" : "text-2xl"}`}
        >
          {event.title}
        </h3>
        <p className="mt-2 max-w-md leading-7 text-white/70">{event.summary}</p>
        <span
          aria-hidden="true"
          className="event-card-rule mt-5 block h-px w-full"
        />
      </div>
    </article>
  );
}
