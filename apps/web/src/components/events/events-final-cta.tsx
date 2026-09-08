import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";

export function EventsFinalCta() {
  const { finalCallToAction } = eventsContent;

  return (
    <Section
      tone="navy"
      spacing="generous"
      aria-labelledby="events-final-cta-title"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="border-heritage-gold/25 absolute top-0 right-[10%] h-36 w-36 border-r border-b"
      />
      <Container size="wide" className="relative">
        <div className="max-w-4xl">
          <p className="text-heritage-gold text-eyebrow">
            {finalCallToAction.eyebrow}
          </p>
          <h2
            id="events-final-cta-title"
            className="mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl"
          >
            {finalCallToAction.title}
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76">
            {finalCallToAction.description}
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href={finalCallToAction.primaryCallToAction.href}
              variant="secondary"
              size="large"
              className="!text-fg hover:bg-sunken bg-raised border-white"
            >
              {finalCallToAction.primaryCallToAction.label}
            </LinkButton>
            <LinkButton
              href={finalCallToAction.secondaryCallToAction.href}
              variant="text"
              size="large"
              className="decoration-heritage-gold hover:text-heritage-gold text-white"
            >
              {finalCallToAction.secondaryCallToAction.label}
            </LinkButton>
          </div>
          {/* Events and the Global Events initiative are the same programme
              seen from two sides; the page should say so. */}
          <LinkButton
            href="/initiatives/global-events"
            variant="text"
            className="mt-7 text-sm text-white/72 decoration-white/40 hover:text-white"
          >
            Explore Global Events
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
