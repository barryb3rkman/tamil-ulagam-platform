import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";

export function CoreObjectivesSection() {
  const { objectives } = aboutContent;

  return (
    <Section tone="ivory" aria-labelledby="objectives-title">
      <Container size="wide">
        <SectionHeading eyebrow={objectives.eyebrow} title={objectives.title} />
        <ol className="border-global-navy/12 mt-12 grid border-t lg:grid-cols-2">
          {objectives.entries.map((objective, index) => (
            <li
              key={objective.title}
              className="border-global-navy/12 grid gap-5 border-b py-8 sm:grid-cols-[4.5rem_1fr] sm:gap-7 sm:py-10 lg:pr-10 odd:lg:border-r even:lg:pr-0 even:lg:pl-10"
            >
              <span className="text-heritage-gold text-4xl leading-none font-semibold">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-global-navy text-2xl font-semibold tracking-[-0.025em]">
                  {objective.title}
                </h3>
                <p className="text-slate mt-3 max-w-xl leading-7">
                  {objective.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
