import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { contactContent } from "@/content/contact";

export function UrgentMattersSection() {
  const { urgentMatters } = contactContent;

  return (
    <Section tone="navy" aria-labelledby="urgent-matters-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="urgent-matters-title"
          eyebrow={urgentMatters.eyebrow}
          title={urgentMatters.title}
          description={urgentMatters.description}
          className="[&>h2]:text-white [&>p:last-child]:text-white/78"
        />
        <div>
          <ul className="grid border-t border-white/16 sm:grid-cols-2">
            {urgentMatters.items.map((item) => (
              <li
                key={item}
                className="border-b border-white/16 py-4 leading-7 text-white/86 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="border-heritage-gold/55 mt-8 border-l-2 pl-5 text-lg leading-8 text-white/86">
            {urgentMatters.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}

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
            <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
              {institutionalEnquiries.details.map((detail) => (
                <li
                  key={detail}
                  className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
                >
                  {detail}
                </li>
              ))}
            </ul>
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
        <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.14em] uppercase">
          {workflow.label}
        </p>
        <ol className="border-global-navy/12 mt-5 grid border-t md:grid-cols-2 xl:grid-cols-3">
          {workflow.steps.map((step) => (
            <li
              key={step.number}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
                {step.number}
              </span>
              <h3 className="text-global-navy mt-3 text-xl font-semibold">
                {step.title}
              </h3>
              <p className="text-slate mt-3 leading-7">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
