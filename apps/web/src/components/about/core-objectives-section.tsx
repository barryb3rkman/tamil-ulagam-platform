import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";
import { EditorialMosaic } from "@/components/editorial-mosaic";
import { AscentIllustration } from "@/components/illustration/brand-illustrations";

export function CoreObjectivesSection() {
  const { objectives } = aboutContent;

  return (
    <Section tone="ivory" aria-labelledby="objectives-title">
      <Container size="wide">
        <SectionHeading eyebrow={objectives.eyebrow} title={objectives.title} />
        <EditorialMosaic
          figure={<AscentIllustration />}
          items={objectives.entries.map((objective) => ({
            title: objective.title,
            description: objective.description,
          }))}
        />
      </Container>
    </Section>
  );
}
