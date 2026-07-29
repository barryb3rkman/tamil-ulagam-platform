import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";

export function GlobalChallengeSection() {
  const { challenge } = aboutContent;

  return (
    <Section tone="white" aria-labelledby="challenge-title">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
          <SectionHeading
            eyebrow={challenge.eyebrow}
            title={challenge.title}
            description={challenge.description}
            className="lg:sticky lg:top-24 lg:self-start"
          />
          <ol className="border-global-navy/12 grid divide-y border-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {challenge.statements.map((statement, index) => (
              <li
                key={statement.title}
                className="border-global-navy/12 p-7 sm:border-b sm:p-8 even:sm:border-r-0 sm:[&:nth-child(-n+2)]:border-b-0"
              >
                <span className="text-heritage-gold text-3xl font-semibold">
                  0{index + 1}
                </span>
                <h3 className="text-global-navy mt-6 text-2xl font-semibold tracking-[-0.025em]">
                  {statement.title}
                </h3>
                <p className="text-slate mt-3 leading-7">
                  {statement.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
