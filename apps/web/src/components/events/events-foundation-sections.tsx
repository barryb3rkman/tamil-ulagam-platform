import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";

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
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {definition.capabilities.map((capability) => (
              <li
                key={capability}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {capability}
              </li>
            ))}
          </ul>
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
        <ol className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2 xl:grid-cols-3">
          {categories.items.map((item, index) => (
            <li
              key={item.title}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-global-navy mt-3 text-xl font-semibold">
                {item.title}
              </h3>
              <p className="text-slate mt-3 leading-7">{item.description}</p>
            </li>
          ))}
        </ol>
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
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {organisers.categories.map((category) => (
              <li
                key={category}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {category}
              </li>
            ))}
          </ul>
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 leading-7">
            {organisers.statement}
          </p>
          <div className="border-global-navy/12 mt-8 border-t pt-6">
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
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
          className="[&>h2]:text-white"
        />
        <p className="text-heritage-gold mt-7 text-sm font-semibold tracking-[0.14em] uppercase">
          Organiser pathway
        </p>
        <ol className="mt-5 grid border-t border-white/16 md:grid-cols-2 xl:grid-cols-3">
          {organiserPathway.steps.map((step) => (
            <li
              key={step.number}
              className="border-b border-white/16 py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
                {step.number}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-3 leading-7 text-white/78">{step.description}</p>
            </li>
          ))}
        </ol>
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
        <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.14em] uppercase">
          Event lifecycle
        </p>
        <ol className="border-global-navy/12 mt-5 grid border-t md:grid-cols-2 xl:grid-cols-4">
          {lifecycle.steps.map((step) => (
            <li
              key={step.number}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(4n)]:border-r-0 xl:[&:nth-child(4n+1)]:pl-0"
            >
              <span className="text-heritage-maroon text-sm font-semibold tracking-[0.14em]">
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
