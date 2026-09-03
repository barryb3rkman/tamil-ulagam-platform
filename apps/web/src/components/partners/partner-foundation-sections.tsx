import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { partnersContent } from "@/content/partners";
import { CollapsibleSection } from "@/components/collapsible-section";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

export function PartnershipDefinitionSection() {
  const { definition } = partnersContent;

  return (
    <Section
      id="partnership-model"
      tone="white"
      className="scroll-mt-24"
      aria-labelledby="partnership-model-title"
    >
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="partnership-model-title"
          eyebrow={definition.eyebrow}
          title={definition.title}
          description={definition.description}
        />
        <div className="grid gap-4">
          <NumberedGrid columns={2} items={definition.principles} />
          <NumberedGrid
            columns={3}
            headingLevel={3}
            startAt={definition.principles.length + 1}
            items={definition.strategicPrinciples}
          />
        </div>
      </Container>
    </Section>
  );
}

export function PartnerCategoriesSection() {
  const { categories } = partnersContent;
  return (
    <Section tone="ivory" aria-labelledby="partner-categories-title">
      <Container size="wide">
        <SectionHeading
          id="partner-categories-title"
          eyebrow={categories.eyebrow}
          title={categories.title}
        />
        <div className="mt-10">
          <CheckGrid columns={3} items={categories.items} />
        </div>
        <p className="border-heritage-maroon/35 text-slate mt-8 max-w-4xl border-l-2 pl-5 text-lg leading-8">
          {categories.statement}
        </p>
      </Container>
    </Section>
  );
}

export function CollaborationModelsSection() {
  const { collaborationModels } = partnersContent;
  return (
    <Section tone="white" aria-labelledby="collaboration-models-title">
      <Container size="wide">
        <SectionHeading
          id="collaboration-models-title"
          eyebrow={collaborationModels.eyebrow}
          title={collaborationModels.title}
        />
        <div className="mt-10">
          <NumberedGrid
            columns={3}
            headingLevel={3}
            items={collaborationModels.models}
          />
        </div>
      </Container>
    </Section>
  );
}

export function PartnershipBoundariesSection() {
  const { boundaries } = partnersContent;
  return (
    <Section tone="navy" aria-labelledby="partnership-boundaries-title">
      <Container size="wide">
        <CollapsibleSection
          tone="dark"
          eyebrow={boundaries.eyebrow}
          title={boundaries.title}
          summary={boundaries.statement}
        >
          <CheckGrid items={boundaries.items} marker="exclude" tone="dark" />
        </CollapsibleSection>
      </Container>
    </Section>
  );
}
