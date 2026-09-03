import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { initiativeOverviewContent } from "@/content/initiatives-overview";
import { NumeralFeature } from "@/components/numeral-feature";

export function ReadinessPrinciplesSection() {
  const { readiness } = initiativeOverviewContent;

  return (
    <Section tone="white" aria-labelledby="readiness-principles-title">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div>
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              {readiness.eyebrow}
            </p>
            <h2
              id="readiness-principles-title"
              className="text-global-navy mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              {readiness.title}
            </h2>
            <p className="text-slate mt-6 max-w-xl text-lg leading-8">
              {readiness.description}
            </p>
            <LinkButton
              href={readiness.callToAction.href}
              variant="text"
              className="mt-8"
            >
              {readiness.callToAction.label}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </LinkButton>
          </div>
          <NumeralFeature
            items={readiness.principles.map((principle) => ({
              title: principle,
            }))}
          />
        </div>
      </Container>
    </Section>
  );
}
