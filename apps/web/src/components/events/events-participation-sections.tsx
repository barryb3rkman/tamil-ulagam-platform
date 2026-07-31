import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";

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
          <ol className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {readiness.items.map((item, index) => (
              <li
                key={item}
                className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-maroon text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7">{item}</p>
              </li>
            ))}
          </ol>
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
          <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.12em] uppercase">
            {interest.notice}
          </p>
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
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
