import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { chaptersContent } from "@/content/chapters";

export function ChapterRegionsSection() {
  const { directory } = chaptersContent;

  return (
    <Section tone="white" aria-labelledby="chapter-regions-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="chapter-regions-title"
          eyebrow={directory.eyebrow}
          title={directory.title}
          description={directory.description}
        />
        <div>
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {directory.areas.map((area) => (
              <li
                key={area}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {area}
              </li>
            ))}
          </ul>
          <p className="text-slate mt-7 leading-7">
            Chapter recognition complements existing Tamil organisations and
            does not imply control over them. A listed region does not represent
            an operating chapter.
          </p>
        </div>
      </Container>
    </Section>
  );
}

export function ChapterReadinessSection() {
  const { readiness } = chaptersContent;

  return (
    <Section tone="navy" aria-labelledby="chapter-readiness-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          eyebrow={readiness.eyebrow}
          title={readiness.title}
          className="[&>h2]:text-white"
        />
        <div>
          <ol className="grid border-t border-white/16 sm:grid-cols-2">
            {readiness.requirements.map((requirement, index) => (
              <li
                key={requirement}
                className="grid gap-4 border-b border-white/16 py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7 text-white/84">{requirement}</p>
              </li>
            ))}
          </ol>
          <p className="border-heritage-gold/55 mt-8 border-l-2 pl-5 text-lg leading-8 text-white/84">
            {readiness.statement}
          </p>
          <LinkButton
            href={readiness.callToAction.href}
            variant="text"
            className="decoration-heritage-gold hover:text-heritage-gold mt-7 text-white"
          >
            {readiness.callToAction.label}
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}

export function ChapterInterestSection() {
  const { interest } = chaptersContent;

  return (
    <Section tone="ivory" aria-labelledby="chapter-interest-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          eyebrow={interest.eyebrow}
          title={interest.title}
          description={interest.description}
        />
        <div>
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {interest.areas.map((area) => (
              <li
                key={area}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {area}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton href={interest.primaryCallToAction.href} size="large">
              {interest.primaryCallToAction.label}
            </LinkButton>
            <LinkButton
              href={interest.secondaryCallToAction.href}
              variant="secondary"
              size="large"
            >
              {interest.secondaryCallToAction.label}
            </LinkButton>
          </div>
          <LinkButton
            href={interest.textCallToAction.href}
            variant="text"
            className="mt-6"
          >
            {interest.textCallToAction.label}
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
