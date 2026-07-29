import { Container, Section } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";

export function AboutManifesto() {
  return (
    <Section tone="white" spacing="generous" aria-labelledby="manifesto-title">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.65fr)] lg:gap-24">
          <div>
            <div
              aria-hidden="true"
              className="bg-heritage-gold mb-8 h-1 w-16"
            />
            <h2
              id="manifesto-title"
              className="text-global-navy max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl"
            >
              {aboutContent.manifesto.statement}
            </h2>
          </div>
          <div className="border-global-navy/12 lg:mt-3 lg:border-l lg:pl-10">
            {aboutContent.manifesto.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-slate mb-6 text-lg leading-8 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
