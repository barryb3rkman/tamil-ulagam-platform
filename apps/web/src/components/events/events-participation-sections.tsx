import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

export function EventsReadinessSection() {
  const { readiness } = eventsContent;

  return (
    <Section tone="ivory" aria-labelledby="events-readiness-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="events-readiness-title"
          eyebrow={readiness.eyebrow}
          title={readiness.title}
        />
        <div>
          <NumberedGrid items={readiness.items} />
          <LinkButton
            href={readiness.callToAction.href}
            variant="text"
            className="mt-7"
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

export function EventsInterestSection() {
  const { interest } = eventsContent;

  return (
    <Section tone="white" aria-labelledby="events-interest-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="events-interest-title"
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
