import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { chaptersContent } from "@/content/chapters";
import { CheckGrid } from "@/components/numbered-grid";
import { EditorialMosaic } from "@/components/editorial-mosaic";
import { NumeralFeature } from "@/components/numeral-feature";
import { NetworkIllustration } from "@/components/illustration/brand-illustrations";

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
          <NumeralFeature
            items={definition.principles.map((principle) => ({
              title: principle,
            }))}
          />
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
        <EditorialMosaic
          figure={<NetworkIllustration />}
          items={localValue.statements.map((statement) => ({
            title: statement.title,
            description: statement.description,
          }))}
        />
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
          tone="inverse"
          className="[&>p]:text-white/74"
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
              <CheckGrid columns={2} items={group.items} tone="dark" />
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
