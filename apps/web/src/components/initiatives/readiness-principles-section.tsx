import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { initiativeOverviewContent } from "@/content/initiatives-overview";

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
          <ol className="border-global-navy/12 grid divide-y border-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {readiness.principles.map((principle, index) => (
              <li
                key={principle}
                className="border-global-navy/12 grid grid-cols-[2.75rem_1fr] gap-4 p-6 sm:p-8 odd:sm:border-b"
              >
                <span className="text-heritage-gold text-lg font-semibold">
                  0{index + 1}
                </span>
                <p className="text-global-navy text-lg font-semibold">
                  {principle}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
