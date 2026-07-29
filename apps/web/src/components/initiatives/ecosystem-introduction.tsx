import { Container, Section } from "@tamil-ulagam/ui";

import { initiativeOverviewContent } from "@/content/initiatives-overview";

export function EcosystemIntroduction() {
  const { introduction } = initiativeOverviewContent;

  return (
    <Section
      tone="white"
      spacing="generous"
      aria-labelledby="ecosystem-introduction-title"
    >
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-20">
          <div>
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              {introduction.eyebrow}
            </p>
            <h2
              id="ecosystem-introduction-title"
              className="text-global-navy mt-5 max-w-xl text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              {introduction.title}
            </h2>
          </div>
          <div className="border-global-navy/12 lg:border-l lg:pl-12">
            <p className="text-slate max-w-2xl text-lg leading-8">
              {introduction.description}
            </p>
            <ol className="border-global-navy/12 mt-9 grid divide-y border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {introduction.principles.map((principle, index) => (
                <li key={principle.title} className="p-6 sm:p-7">
                  <span className="text-heritage-gold text-2xl font-semibold">
                    0{index + 1}
                  </span>
                  <h3 className="text-global-navy mt-5 text-xl font-semibold tracking-[-0.025em]">
                    {principle.title}
                  </h3>
                  <p className="text-slate mt-3 text-sm leading-6">
                    {principle.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
