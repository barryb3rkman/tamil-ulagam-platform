import { Container, Section } from "@tamil-ulagam/ui";

import { initiativeOverviewContent } from "@/content/initiatives-overview";
import { EditorialMosaic } from "@/components/editorial-mosaic";
import { ExchangeIllustration } from "@/components/illustration/brand-illustrations";

export function EcosystemIntroduction() {
  const { introduction } = initiativeOverviewContent;

  return (
    <Section
      tone="white"
      spacing="generous"
      aria-labelledby="ecosystem-introduction-title"
    >
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-20">
          <div>
            <p className="text-heritage-maroon text-eyebrow">
              {introduction.eyebrow}
            </p>
            <h2
              id="ecosystem-introduction-title"
              className="text-global-navy mt-5 max-w-xl text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              {introduction.title}
            </h2>
          </div>
          <div className="border-global-navy/12 lg:border-l lg:pl-12">
            <p className="text-slate max-w-2xl text-lg leading-8">
              {introduction.description}
            </p>
            <EditorialMosaic
              figure={<ExchangeIllustration />}
              items={introduction.principles.map((principle) => ({
                title: principle.title,
                description: principle.description,
              }))}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
