import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";

export function AboutFinalCta() {
  const { finalCallToAction } = aboutContent;

  return (
    <Section
      tone="navy"
      spacing="generous"
      aria-labelledby="about-final-cta-title"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="border-heritage-gold/25 absolute top-0 right-[12%] h-36 w-36 border-r border-b"
      />
      <Container size="wide" className="relative">
        <div className="max-w-3xl">
          <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
            PARTICIPATE IN THE VISION
          </p>
          <h2
            id="about-final-cta-title"
            className="mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl"
          >
            {finalCallToAction.title}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
            {finalCallToAction.description}
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href={finalCallToAction.primaryCallToAction.href}
              variant="secondary"
              size="large"
              className="text-global-navy hover:bg-warm-ivory hover:text-deep-navy border-white bg-white"
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
            href={finalCallToAction.contactCallToAction.href}
            variant="text"
            className="mt-7 text-sm text-white/72 decoration-white/40 hover:text-white"
          >
            {finalCallToAction.contactCallToAction.label}
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
