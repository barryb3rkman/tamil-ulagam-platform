import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { CollapsibleSection } from "@/components/collapsible-section";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

import { tamilIdContent } from "@/content/tamil-id";

export function TamilIdDefinition() {
  const { definition, notGovernmentId } = tamilIdContent;

  return (
    <>
      <Section id="what-is-tamil-id" tone="white" className="scroll-mt-24">
        <Container size="wide">
          <div className="max-w-4xl">
            <SectionHeading
              eyebrow={definition.eyebrow}
              title={definition.title}
            />
            <p className="text-global-navy mt-6 max-w-3xl text-xl leading-8 font-semibold sm:text-2xl sm:leading-9">
              {definition.description}
            </p>
          </div>
          <div className="mt-12">
            <NumberedGrid columns={3} items={definition.principles} />
          </div>
        </Container>
      </Section>
      <Section tone="ivory">
        <Container size="wide">
          <CollapsibleSection
            eyebrow={notGovernmentId.eyebrow}
            title={notGovernmentId.title}
            summary={notGovernmentId.description}
          >
            <CheckGrid
              columns={3}
              items={notGovernmentId.items}
              marker="exclude"
            />
          </CollapsibleSection>
        </Container>
      </Section>
    </>
  );
}
