import { Badge, Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { roadmapPageContent } from "@/content/roadmap-page";

export function RoadmapPrinciples() {
  const { sequence } = roadmapPageContent;

  return (
    <Section tone="white" aria-labelledby="roadmap-principles-title">
      <Container size="wide">
        <SectionHeading
          id="roadmap-principles-title"
          eyebrow={sequence.eyebrow}
          title={sequence.title}
          description={sequence.description}
        />
        <ol className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2 xl:grid-cols-5">
          {sequence.principles.map((principle, index) => (
            <li
              key={principle.title}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(5n)]:border-r-0 xl:[&:nth-child(5n+1)]:pl-0"
            >
              <span className="text-heritage-maroon text-sm font-semibold tracking-[0.14em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-global-navy mt-3 text-xl font-semibold">
                {principle.title}
              </h3>
              <p className="text-slate mt-3 leading-7">
                {principle.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function CurrentFoundationSection() {
  const { foundation } = roadmapPageContent;

  return (
    <Section tone="ivory" aria-labelledby="current-foundation-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="current-foundation-title"
          eyebrow={foundation.eyebrow}
          title={foundation.title}
          description={foundation.description}
        />
        <div>
          <Badge tone="maroon">{foundation.status}</Badge>
          <ul className="border-global-navy/12 mt-7 grid border-t sm:grid-cols-2">
            {foundation.items.map((item) => (
              <li
                key={item}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

export function DependencySection() {
  const { dependencies } = roadmapPageContent;

  return (
    <Section tone="navy" aria-labelledby="roadmap-dependencies-title">
      <Container size="wide">
        <SectionHeading
          id="roadmap-dependencies-title"
          eyebrow={dependencies.eyebrow}
          title={dependencies.title}
          description={dependencies.description}
          className="[&>h2]:text-white [&>p]:text-white/74"
        />
        <ol className="mt-10 grid border-t border-white/16 md:grid-cols-2 xl:grid-cols-3">
          {dependencies.items.map((item, index) => (
            <li
              key={item.phaseId}
              className="border-b border-white/16 py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-white/76">{item.description}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm leading-6 text-white/58">
          The dependency sequence is expressed in text so it remains clear
          without visual arrows or motion.
        </p>
      </Container>
    </Section>
  );
}

export function PlatformLayersSection() {
  const { platformLayers } = roadmapPageContent;

  return (
    <Section tone="white" aria-labelledby="platform-layers-title">
      <Container size="wide">
        <SectionHeading
          id="platform-layers-title"
          eyebrow={platformLayers.eyebrow}
          title={platformLayers.title}
          description={platformLayers.description}
        />
        <Badge tone="neutral" className="mt-7">
          {platformLayers.status}
        </Badge>
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {platformLayers.layers.map((layer) => (
            <section
              key={layer.title}
              aria-labelledby={`${layer.title.toLowerCase().replaceAll(" ", "-")}-title`}
              className="border-global-navy/12 bg-warm-ivory border p-6 sm:p-8"
            >
              <h3
                id={`${layer.title.toLowerCase().replaceAll(" ", "-")}-title`}
                className="text-global-navy text-2xl font-semibold"
              >
                {layer.title}
              </h3>
              <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
                {layer.items.map((item) => (
                  <li
                    key={item}
                    className="border-global-navy/12 border-b py-3 text-sm leading-6 sm:px-4 sm:odd:pl-0 sm:even:border-l"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </Section>
  );
}
