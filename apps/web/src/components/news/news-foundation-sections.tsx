import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";
import { newsContent } from "@/content/news";
import { NumeralFeature } from "@/components/numeral-feature";

export function NewsroomDefinitionSection() {
  const { definition } = newsContent;

  return (
    <Section
      id="editorial-model"
      tone="white"
      className="scroll-mt-24"
      aria-labelledby="editorial-model-title"
    >
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="editorial-model-title"
          eyebrow={definition.eyebrow}
          title={definition.title}
          description={definition.description}
        />
        <div>
          <CheckGrid columns={2} items={definition.capabilities} />
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 text-lg leading-8">
            {definition.statement}
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {definition.principles.map((principle) => (
              <section
                key={principle.title}
                className="border-global-navy/12 border p-6"
              >
                <h3 className="text-global-navy text-xl font-semibold">
                  {principle.title}
                </h3>
                <p className="text-slate mt-3 leading-7">
                  {principle.description}
                </p>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function PublicationTypesSection() {
  const { publicationTypes } = newsContent;

  return (
    <Section tone="ivory" aria-labelledby="publication-types-title">
      <Container size="wide">
        <SectionHeading
          id="publication-types-title"
          eyebrow={publicationTypes.eyebrow}
          title={publicationTypes.title}
        />
        <div className="mt-10">
          <NumberedGrid
            columns={3}
            gridAttribute="data-publication-type-grid"
            headingLevel={3}
            itemAttribute="data-publication-type-card"
            items={publicationTypes.items}
          />
        </div>
      </Container>
    </Section>
  );
}

export function EditorialDistinctionsSection() {
  const { distinctions } = newsContent;

  return (
    <Section tone="white" aria-labelledby="editorial-distinctions-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20"
      >
        <SectionHeading
          id="editorial-distinctions-title"
          eyebrow={distinctions.eyebrow}
          title={distinctions.title}
        />
        <dl className="border-global-navy/12 divide-global-navy/12 border-y">
          {distinctions.items.map((item) => (
            <div
              key={item.title}
              className="grid gap-3 py-6 sm:grid-cols-[13rem_1fr] sm:gap-7"
            >
              <dt className="text-heritage-maroon text-sm font-semibold tracking-[0.12em] uppercase">
                {item.title}
              </dt>
              <dd className="text-slate leading-7">{item.description}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

export function EditorialPrinciplesSection() {
  const { principles } = newsContent;

  return (
    <Section tone="navy" aria-labelledby="editorial-principles-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="editorial-principles-title"
          eyebrow={principles.eyebrow}
          title={principles.title}
          tone="inverse"
        />
        <div>
          <NumberedGrid items={principles.items} tone="dark" />
          <p className="border-heritage-gold/55 mt-8 border-l-2 pl-5 text-lg leading-8 text-white/84">
            {principles.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}

export function PublishingWorkflowSection() {
  const { workflow } = newsContent;

  return (
    <Section tone="ivory" aria-labelledby="publishing-workflow-title">
      <Container size="wide">
        <SectionHeading
          id="publishing-workflow-title"
          eyebrow={workflow.eyebrow}
          title={workflow.title}
          description={workflow.description}
        />
        <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.14em] uppercase">
          {workflow.label}
        </p>
        <NumeralFeature
          items={workflow.steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
        />
      </Container>
    </Section>
  );
}
