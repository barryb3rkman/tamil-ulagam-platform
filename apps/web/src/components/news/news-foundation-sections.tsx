import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { newsContent } from "@/content/news";

function getPublicationTypeLayout(index: number) {
  switch (index) {
    case 0:
      return "md:border-r md:pr-6 xl:col-span-2";
    case 1:
      return "md:pl-6 xl:col-span-2 xl:border-r xl:pr-6";
    case 2:
      return "md:border-r md:pr-6 xl:col-span-2 xl:border-r-0 xl:pl-6 xl:pr-0";
    case 3:
      return "md:pl-6 xl:col-span-3 xl:border-r xl:pl-0 xl:pr-6";
    case 4:
      return "md:col-span-2 xl:col-span-3 xl:pl-6";
    default:
      return "md:px-6 xl:col-span-2";
  }
}

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
        <ol
          data-publication-type-grid
          className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2 xl:grid-cols-6"
        >
          {publicationTypes.items.map((item, index) => (
            <li
              key={item.title}
              data-publication-type-card
              className={`border-global-navy/12 border-b py-6 ${getPublicationTypeLayout(index)}`}
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
          className="[&>h2]:text-white"
        />
        <div>
          <ol className="grid border-t border-white/16 sm:grid-cols-2">
            {principles.items.map((principle, index) => (
              <li
                key={principle}
                className="grid gap-4 border-b border-white/16 py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7 text-white/84">{principle}</p>
              </li>
            ))}
          </ol>
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
        <ol className="border-global-navy/12 mt-5 grid border-t md:grid-cols-2 xl:grid-cols-3">
          {workflow.steps.map((step) => (
            <li
              key={step.number}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
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
