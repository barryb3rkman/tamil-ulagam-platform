import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { contactContent } from "@/content/contact";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

export function ContactPurposeSection() {
  const { purpose } = contactContent;

  return (
    <Section
      id="contact-paths"
      tone="white"
      className="scroll-mt-24"
      aria-labelledby="contact-paths-title"
    >
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="contact-paths-title"
          eyebrow={purpose.eyebrow}
          title={purpose.title}
          description={purpose.description}
        />
        <div>
          <NumberedGrid items={purpose.guidance} />
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 text-lg leading-8">
            {purpose.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}

export function EnquiryCategoriesSection() {
  const { categories } = contactContent;

  return (
    <Section tone="ivory" aria-labelledby="enquiry-categories-title">
      <Container size="wide">
        <SectionHeading
          id="enquiry-categories-title"
          eyebrow={categories.eyebrow}
          title={categories.title}
        />
        <div className="mt-10">
          <NumberedGrid columns={3} headingLevel={3} items={categories.items} />
        </div>
      </Container>
    </Section>
  );
}

export function InformationToIncludeSection() {
  const { informationToInclude } = contactContent;

  return (
    <Section tone="white" aria-labelledby="information-to-include-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="information-to-include-title"
          eyebrow={informationToInclude.eyebrow}
          title={informationToInclude.title}
          description={informationToInclude.description}
        />
        <CheckGrid columns={2} items={informationToInclude.items} />
      </Container>
    </Section>
  );
}
