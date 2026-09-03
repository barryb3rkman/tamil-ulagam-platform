import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { chaptersContent } from "@/content/chapters";
import { SequenceSpine } from "@/components/sequence-spine";
import { NumeralFeature } from "@/components/numeral-feature";

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
        <p className="text-heritage-maroon text-eyebrow mt-7">
          Chapter formation journey
        </p>
        <SequenceSpine
          steps={formationJourney.steps.map((step) => ({
            marker: step.number,
            title: step.title,
            description: step.description,
          }))}
        />
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
        <NumeralFeature
          items={responsibilities.items.map((item) => ({
            title: item,
          }))}
        />
      </Container>
    </Section>
  );
}
