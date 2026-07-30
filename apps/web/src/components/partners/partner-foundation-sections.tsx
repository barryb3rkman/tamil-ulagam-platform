import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { partnersContent } from "@/content/partners";

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
        <div>
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {definition.principles.map((item, index) => (
              <li
                key={item}
                className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-charcoal leading-7">{item}</p>
              </li>
            ))}
          </ul>
          <ol className="border-global-navy/12 mt-8 grid border-t sm:grid-cols-2 xl:grid-cols-5">
            {definition.strategicPrinciples.map((principle, index) => (
              <li
                key={principle.title}
                className="border-global-navy/12 border-b py-5 sm:px-5 sm:odd:pl-0 xl:border-r xl:[&:nth-child(5n)]:border-r-0 xl:[&:nth-child(5n+1)]:pl-0"
              >
                <span className="text-heritage-maroon text-sm font-semibold tracking-[0.14em]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-global-navy mt-3 text-lg font-semibold">
                  {principle.title}
                </h3>
                <p className="text-slate mt-3 leading-7">
                  {principle.description}
                </p>
              </li>
            ))}
          </ol>
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
        <ul className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2 xl:grid-cols-3">
          {categories.items.map((item) => (
            <li
              key={item}
              className="border-global-navy/12 border-b py-5 leading-7 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:pl-0"
            >
              {item}
            </li>
          ))}
        </ul>
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
        <ol className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2 xl:grid-cols-4">
          {collaborationModels.models.map((model) => (
            <li
              key={model.number}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(4n)]:border-r-0 xl:[&:nth-child(4n+1)]:pl-0"
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
                {model.number}
              </span>
              <h3 className="text-global-navy mt-3 text-xl font-semibold">
                {model.title}
              </h3>
              <p className="text-slate mt-3 leading-7">{model.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function PartnershipBoundariesSection() {
  const { boundaries } = partnersContent;
  return (
    <Section tone="navy" aria-labelledby="partnership-boundaries-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="partnership-boundaries-title"
          eyebrow={boundaries.eyebrow}
          title={boundaries.title}
          className="[&>h2]:text-white"
        />
        <div>
          <ul className="grid border-t border-white/16 sm:grid-cols-2">
            {boundaries.items.map((item) => (
              <li
                key={item}
                className="border-b border-white/16 py-4 leading-7 text-white/84 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="border-heritage-gold/55 mt-8 border-l-2 pl-5 text-lg leading-8 text-white/84">
            {boundaries.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}
