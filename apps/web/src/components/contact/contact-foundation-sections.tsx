import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { contactContent } from "@/content/contact";

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
          <ol className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {purpose.guidance.map((item, index) => (
              <li
                key={item}
                className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7">{item}</p>
              </li>
            ))}
          </ol>
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
        <ol className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2 xl:grid-cols-3">
          {categories.items.map((category, index) => (
            <li
              key={category.title}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(3n)]:border-r-0 xl:[&:nth-child(3n+1)]:pl-0"
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-global-navy mt-3 text-xl font-semibold">
                {category.title}
              </h3>
              <p className="text-slate mt-3 leading-7">
                {category.description}
              </p>
              <LinkButton
                href={category.href}
                variant="text"
                className="mt-5 text-sm"
              >
                {category.linkLabel}
                <span aria-hidden="true" className="ml-2">
                  ↗
                </span>
              </LinkButton>
            </li>
          ))}
        </ol>
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
        <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
          {informationToInclude.items.map((item) => (
            <li
              key={item}
              className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
            >
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function InformationBoundarySection() {
  const { informationNotToSend } = contactContent;

  return (
    <Section tone="navy" aria-labelledby="information-boundary-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="information-boundary-title"
          eyebrow={informationNotToSend.eyebrow}
          title={informationNotToSend.title}
          className="[&>h2]:text-white"
        />
        <div>
          <ul className="grid border-t border-white/16 sm:grid-cols-2">
            {informationNotToSend.items.map((item) => (
              <li
                key={item}
                className="border-b border-white/16 py-4 leading-7 text-white/84 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="border-heritage-gold/55 mt-8 border-l-2 pl-5 text-lg leading-8 text-white/86">
            {informationNotToSend.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}
