import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";
import { EditorialMosaic } from "@/components/editorial-mosaic";
import { NetworkIllustration } from "@/components/illustration/brand-illustrations";

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
          <EditorialMosaic
            figure={<NetworkIllustration />}
            items={challenge.statements.map((statement) => ({
              title: statement.title,
              description: statement.description,
            }))}
          />
        </div>
      </Container>
    </Section>
  );
}
