import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { contactContent } from "@/content/contact";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

export function ContactRoutingSection() {
  const { routing } = contactContent;

  return (
    <Section tone="ivory" aria-labelledby="contact-routing-title">
      <Container size="wide">
        <SectionHeading
          id="contact-routing-title"
          eyebrow={routing.eyebrow}
          title={routing.title}
        />
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <section aria-labelledby="routing-areas-title">
            <h3
              id="routing-areas-title"
              className="text-global-navy text-xl font-semibold"
            >
              Enquiry routing areas
            </h3>
            <CheckGrid columns={2} items={routing.areas} />
          </section>
          <section aria-labelledby="routing-principles-title">
            <h3
              id="routing-principles-title"
              className="text-global-navy text-xl font-semibold"
            >
              Routing principles
            </h3>
            <NumberedGrid items={routing.principles} />
          </section>
        </div>
      </Container>
    </Section>
  );
}

export function ContactPrivacySection() {
  const { privacy } = contactContent;

  return (
    <Section tone="white" aria-labelledby="contact-privacy-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="contact-privacy-title"
          eyebrow={privacy.eyebrow}
          title={privacy.title}
          description={privacy.description}
        />
        <NumberedGrid items={privacy.principles} />
      </Container>
    </Section>
  );
}

export function ResponseExpectationsSection() {
  const { responseExpectations } = contactContent;

  return (
    <Section tone="ivory" aria-labelledby="response-expectations-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="response-expectations-title"
          eyebrow={responseExpectations.eyebrow}
          title={responseExpectations.title}
        />
        <div>
          <CheckGrid columns={2} items={responseExpectations.items} />
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 text-lg leading-8">
            {responseExpectations.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}
