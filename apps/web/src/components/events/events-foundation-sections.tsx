import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";
import { NumeralFeature } from "@/components/numeral-feature";

export function EventsDefinitionSection() {
  const { definition } = eventsContent;

  return (
    <Section
      id="events-model"
      tone="white"
      className="scroll-mt-24"
      aria-labelledby="events-model-title"
    >
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="events-model-title"
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

export function EventCategoriesSection() {
  const { categories } = eventsContent;

  return (
    <Section tone="ivory" aria-labelledby="event-categories-title">
      <Container size="wide">
        <SectionHeading
          id="event-categories-title"
          eyebrow={categories.eyebrow}
          title={categories.title}
        />
        <NumberedGrid columns={3} headingLevel={3} items={categories.items} />
      </Container>
    </Section>
  );
}

export function OrganiserModelSection() {
  const { organisers } = eventsContent;

  return (
    <Section tone="white" aria-labelledby="organiser-model-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="organiser-model-title"
          eyebrow={organisers.eyebrow}
          title={organisers.title}
        />
        <div>
          <CheckGrid columns={2} items={organisers.categories} />
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 leading-7">
            {organisers.statement}
          </p>
          <div className="border-global-navy/12 mt-8 border-t pt-6">
            <p className="text-heritage-maroon text-eyebrow">
              Approval may be limited by
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {organisers.limitations.map((limitation) => (
                <li
                  key={limitation}
                  className="border-global-navy/14 rounded-full border px-4 py-2 text-sm leading-6"
                >
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function OrganiserPathwaySection() {
  const { organiserPathway } = eventsContent;

  return (
    <Section tone="navy" aria-labelledby="organiser-pathway-title">
      <Container size="wide">
        <SectionHeading
          id="organiser-pathway-title"
          eyebrow={organiserPathway.eyebrow}
          title={organiserPathway.title}
          description={organiserPathway.description}
          tone="inverse"
        />
        <p className="text-heritage-gold text-eyebrow mt-7">
          Organiser pathway
        </p>
        <NumeralFeature
          items={organiserPathway.steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
        />
      </Container>
    </Section>
  );
}

export function EventLifecycleSection() {
  const { lifecycle } = eventsContent;

  return (
    <Section tone="ivory" aria-labelledby="event-lifecycle-title">
      <Container size="wide">
        <SectionHeading
          id="event-lifecycle-title"
          eyebrow={lifecycle.eyebrow}
          title={lifecycle.title}
          description={lifecycle.description}
        />
        <p className="text-heritage-maroon text-eyebrow mt-7">
          Event lifecycle
        </p>
        <NumeralFeature
          items={lifecycle.steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
        />
      </Container>
    </Section>
  );
}
