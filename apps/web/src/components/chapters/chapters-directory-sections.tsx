import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { chaptersContent } from "@/content/chapters";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

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
          <CheckGrid columns={2} items={directory.areas} />
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
          tone="inverse"
        />
        <div>
          <NumberedGrid items={readiness.requirements} tone="dark" />
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
          <CheckGrid columns={2} items={interest.areas} />
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
