import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { partnersContent } from "@/content/partners";

export function InitiativeCollaborationSection() {
  const { initiatives } = partnersContent;
  return (
    <Section tone="ivory" aria-labelledby="initiative-collaboration-title">
      <Container size="wide">
        <SectionHeading
          id="initiative-collaboration-title"
          eyebrow={initiatives.eyebrow}
          title={initiatives.title}
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {initiatives.groups.map((group) => (
            <section
              key={group.title}
              className="border-global-navy/12 border bg-white p-6 sm:p-8"
            >
              <h3 className="text-global-navy text-2xl font-semibold">
                {group.title}
              </h3>
              <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border-global-navy/12 border-b py-3 text-sm leading-6 sm:px-4 sm:odd:pl-0 sm:even:border-l"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <LinkButton
                href={group.callToAction.href}
                variant="text"
                className="mt-6"
              >
                {group.callToAction.label}
              </LinkButton>
            </section>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function PartnershipReadinessSection() {
  const { readiness } = partnersContent;
  return (
    <Section tone="navy" aria-labelledby="partnership-readiness-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="partnership-readiness-title"
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

export function PartnershipInterestSection() {
  const { interest } = partnersContent;
  return (
    <Section tone="white" aria-labelledby="partnership-interest-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="partnership-interest-title"
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
