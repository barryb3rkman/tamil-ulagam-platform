import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { chaptersContent } from "@/content/chapters";

export function ChapterFormationJourney() {
  const { formationJourney } = chaptersContent;

  return (
    <Section tone="white" aria-labelledby="chapter-formation-title">
      <Container size="wide">
        <SectionHeading
          eyebrow={formationJourney.eyebrow}
          title={formationJourney.title}
          description={formationJourney.description}
        />
        <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.14em] uppercase">
          Chapter formation journey
        </p>
        <ol className="border-global-navy/12 mt-5 grid border-t md:grid-cols-2 xl:grid-cols-5">
          {formationJourney.steps.map((step) => (
            <li
              key={step.number}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(5n)]:border-r-0 xl:[&:nth-child(5n+1)]:pl-0"
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
                {step.number}
              </span>
              <h3 className="text-global-navy mt-3 text-xl font-semibold">
                {step.title}
              </h3>
              <p className="text-slate mt-3 leading-7">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function ChapterResponsibilitiesSection() {
  const { responsibilities } = chaptersContent;

  return (
    <Section tone="ivory" aria-labelledby="chapter-responsibilities-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          eyebrow={responsibilities.eyebrow}
          title={responsibilities.title}
          description={responsibilities.description}
        />
        <ol className="border-global-navy/12 grid border-t sm:grid-cols-2">
          {responsibilities.items.map((item, index) => (
            <li
              key={item}
              className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
            >
              <span className="text-heritage-maroon text-sm font-semibold">
                0{index + 1}
              </span>
              <p className="text-charcoal leading-7">{item}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
