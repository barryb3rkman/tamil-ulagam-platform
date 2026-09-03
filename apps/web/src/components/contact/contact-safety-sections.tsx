import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { contactContent } from "@/content/contact";
import { CheckGrid } from "@/components/numbered-grid";
import { NumeralFeature } from "@/components/numeral-feature";

export function InstitutionalEnquiriesSection() {
  const { institutionalEnquiries } = contactContent;

  return (
    <Section tone="white" aria-labelledby="institutional-enquiries-title">
      <Container size="wide">
        <SectionHeading
          id="institutional-enquiries-title"
          eyebrow={institutionalEnquiries.eyebrow}
          title={institutionalEnquiries.title}
        />
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="institutional-details-title">
            <h3
              id="institutional-details-title"
              className="text-global-navy text-xl font-semibold"
            >
              Useful institutional context
            </h3>
            <CheckGrid columns={2} items={institutionalEnquiries.details} />
          </section>
          <section aria-labelledby="institutional-boundaries-title">
            <h3
              id="institutional-boundaries-title"
              className="text-global-navy text-xl font-semibold"
            >
              Authority and partnership boundaries
            </h3>
            <ul className="border-heritage-maroon/35 mt-5 space-y-5 border-l-2 pl-5">
              {institutionalEnquiries.boundaries.map((boundary) => (
                <li key={boundary} className="text-slate leading-7">
                  {boundary}
                </li>
              ))}
            </ul>
            <LinkButton
              href={institutionalEnquiries.callToAction.href}
              variant="text"
              className="mt-7"
            >
              {institutionalEnquiries.callToAction.label}
              <span aria-hidden="true" className="ml-2">
                ↗
              </span>
            </LinkButton>
          </section>
        </div>
      </Container>
    </Section>
  );
}

export function FutureContactModelSection() {
  const { workflow } = contactContent;

  return (
    <Section tone="ivory" aria-labelledby="future-contact-workflow-title">
      <Container size="wide">
        <SectionHeading
          id="future-contact-workflow-title"
          eyebrow={workflow.eyebrow}
          title={workflow.title}
          description={workflow.description}
        />
        <p className="text-heritage-maroon text-eyebrow mt-7">
          {workflow.label}
        </p>
        <NumeralFeature
          items={workflow.steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
        />
      </Container>
    </Section>
  );
}
