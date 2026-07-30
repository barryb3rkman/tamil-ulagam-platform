import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { chaptersContent } from "@/content/chapters";

export function ChapterDefinitionSection() {
  const { definition } = chaptersContent;

  return (
    <Section id="chapter-vision" tone="white" className="scroll-mt-24">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading eyebrow={definition.eyebrow} title={definition.title} />
        <div>
          <p className="text-global-navy max-w-2xl text-xl leading-8 font-semibold sm:text-2xl sm:leading-9">
            {definition.description}
          </p>
          <ol className="border-global-navy/12 mt-10 grid border-t sm:grid-cols-2">
            {definition.principles.map((principle, index) => (
              <li
                key={principle}
                className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold tracking-[0.12em]">
                  0{index + 1}
                </span>
                <p className="text-charcoal leading-7">{principle}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

export function LocalValueSection() {
  const { localValue } = chaptersContent;

  return (
    <Section tone="ivory" aria-labelledby="local-value-title">
      <Container size="wide">
        <SectionHeading eyebrow={localValue.eyebrow} title={localValue.title} />
        <ol className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2 xl:grid-cols-3">
          {localValue.statements.map((statement, index) => (
            <li
              key={statement.title}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="text-heritage-maroon text-sm font-semibold tracking-[0.14em]">
                0{index + 1}
              </span>
              <h3 className="text-global-navy mt-3 text-xl font-semibold">
                {statement.title}
              </h3>
              <p className="text-slate mt-3 leading-7">
                {statement.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function GlobalLocalRelationshipSection() {
  const { relationship } = chaptersContent;

  return (
    <Section tone="navy" aria-labelledby="global-local-title">
      <Container size="wide">
        <SectionHeading
          eyebrow={relationship.eyebrow}
          title={relationship.title}
          description={relationship.description}
          className="[&>h2]:text-white [&>p]:text-white/74"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {[relationship.federation, relationship.chapter].map((group) => (
            <div
              key={group.title}
              className="bg-deep-navy/45 border border-white/16 p-6 sm:p-8"
            >
              <h3 className="text-heritage-gold text-xl font-semibold">
                {group.title}
              </h3>
              <ul className="mt-5 grid border-t border-white/16 sm:grid-cols-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border-b border-white/16 py-4 text-white/82 sm:px-5 sm:odd:pl-0 sm:even:border-l"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-heritage-gold/55 mt-8 max-w-4xl border-l-2 pl-5 text-lg leading-8 text-white/82">
          {relationship.statement}
        </p>
      </Container>
    </Section>
  );
}
