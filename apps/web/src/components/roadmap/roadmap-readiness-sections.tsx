import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { roadmapPageContent } from "@/content/roadmap-page";

export function ReadinessGatesSection() {
  const { readiness } = roadmapPageContent;

  return (
    <Section tone="navy" aria-labelledby="roadmap-readiness-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="roadmap-readiness-title"
          eyebrow={readiness.eyebrow}
          title={readiness.title}
          className="[&>h2]:text-white"
        />
        <div>
          <ol className="grid border-t border-white/16 sm:grid-cols-2">
            {readiness.items.map((item, index) => (
              <li
                key={item}
                className="grid gap-4 border-b border-white/16 py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7 text-white/84">{item}</p>
              </li>
            ))}
          </ol>
          <p className="border-heritage-gold/55 mt-8 border-l-2 pl-5 text-lg leading-8 text-white/84">
            {readiness.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}

export function QualityPrinciplesSection() {
  const { quality } = roadmapPageContent;

  return (
    <Section tone="white" aria-labelledby="roadmap-quality-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="roadmap-quality-title"
          eyebrow={quality.eyebrow}
          title={quality.title}
        />
        <div>
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {quality.principles.map((principle, index) => (
              <li
                key={principle}
                className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-maroon text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-charcoal leading-7">{principle}</p>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {quality.links.map((link) => (
              <LinkButton key={link.href} href={link.href} variant="text">
                {link.label}
              </LinkButton>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function ChangeAndTransparencySection() {
  const { adaptability } = roadmapPageContent;

  return (
    <Section tone="ivory" aria-labelledby="roadmap-adaptability-title">
      <Container size="wide">
        <SectionHeading
          id="roadmap-adaptability-title"
          eyebrow={adaptability.eyebrow}
          title={adaptability.title}
          description={adaptability.description}
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <section className="border-global-navy/12 border bg-white p-6 sm:p-8">
            <h3 className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              What may evolve
            </h3>
            <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
              {adaptability.mayChange.map((item) => (
                <li
                  key={item}
                  className="border-global-navy/12 border-b py-3 leading-7 sm:px-4 sm:odd:pl-0 sm:even:border-l"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-deep-navy border border-white/10 p-6 sm:p-8">
            <h3 className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              What should remain stable
            </h3>
            <ul className="mt-5 space-y-3 border-t border-white/16 pt-5">
              {adaptability.remainsStable.map((item) => (
                <li key={item} className="leading-7 text-white/82">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </Section>
  );
}

export function RoadmapParticipationSection() {
  const { participation } = roadmapPageContent;

  return (
    <Section tone="white" aria-labelledby="roadmap-participation-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="roadmap-participation-title"
          eyebrow={participation.eyebrow}
          title={participation.title}
          description={participation.description}
        />
        <div>
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {participation.groups.map((group) => (
              <li
                key={group}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {group}
              </li>
            ))}
          </ul>
          <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.12em] uppercase">
            {participation.note}
          </p>
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href={participation.primaryCallToAction.href}
              size="large"
            >
              {participation.primaryCallToAction.label}
            </LinkButton>
            <LinkButton
              href={participation.secondaryCallToAction.href}
              variant="secondary"
              size="large"
            >
              {participation.secondaryCallToAction.label}
            </LinkButton>
          </div>
          <LinkButton
            href={participation.textCallToAction.href}
            variant="text"
            className="mt-6"
          >
            {participation.textCallToAction.label}
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
