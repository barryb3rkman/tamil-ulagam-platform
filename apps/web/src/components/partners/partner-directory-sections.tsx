import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { partnersContent } from "@/content/partners";

import { PartnershipEnquiryForm } from "./partnership-enquiry-form";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

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
              <CheckGrid columns={2} items={group.items} />
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
          tone="inverse"
        />
        <div>
          <NumberedGrid items={readiness.items} tone="dark" />
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
        <PartnershipEnquiryForm />
      </Container>
    </Section>
  );
}
