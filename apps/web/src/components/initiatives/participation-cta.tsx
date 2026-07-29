import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { initiativeOverviewContent } from "@/content/initiatives-overview";

export function ParticipationCta() {
  const { participation } = initiativeOverviewContent;

  return (
    <Section
      tone="navy"
      spacing="generous"
      aria-labelledby="initiatives-participation-title"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="border-heritage-gold/30 absolute right-[10%] bottom-0 h-44 w-44 border-t border-l"
      />
      <Container size="wide" className="relative">
        <div className="max-w-3xl">
          <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
            {participation.eyebrow}
          </p>
          <h2
            id="initiatives-participation-title"
            className="mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl"
          >
            {participation.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
            {participation.description}
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href={participation.primaryCallToAction.href}
              variant="secondary"
              size="large"
              className="text-global-navy hover:bg-warm-ivory hover:text-deep-navy border-white bg-white"
            >
              {participation.primaryCallToAction.label}
            </LinkButton>
            <LinkButton
              href={participation.secondaryCallToAction.href}
              variant="text"
              size="large"
              className="decoration-heritage-gold hover:text-heritage-gold text-white"
            >
              {participation.secondaryCallToAction.label}
            </LinkButton>
          </div>
          <LinkButton
            href={participation.textCallToAction.href}
            variant="text"
            className="mt-7 text-sm text-white/76 decoration-white/45 hover:text-white"
          >
            {participation.textCallToAction.label}
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
