import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";

export function EventsFaq() {
  return (
    <Section tone="ivory" aria-labelledby="events-faq-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20"
      >
        <SectionHeading
          id="events-faq-title"
          eyebrow="FREQUENTLY ASKED QUESTIONS"
          title="Clear answers for a planned events platform."
        />
        <dl className="border-global-navy/12 divide-global-navy/12 border-y">
          {eventsContent.faqs.map((faq) => (
            <div key={faq.title} className="py-6">
              <dt className="text-global-navy text-xl font-semibold">
                {faq.title}
              </dt>
              <dd className="text-slate mt-3 max-w-3xl leading-7">
                {faq.description}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

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
          <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
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
              className="!text-global-navy hover:bg-warm-ivory border-white bg-white"
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
          <LinkButton
            href={finalCallToAction.textCallToAction.href}
            variant="text"
            className="mt-7 text-sm text-white/72 decoration-white/40 hover:text-white"
          >
            {finalCallToAction.textCallToAction.label}
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
