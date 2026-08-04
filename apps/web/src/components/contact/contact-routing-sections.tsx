import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { contactContent } from "@/content/contact";

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
            <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2 lg:grid-cols-1">
              {routing.areas.map((area) => (
                <li
                  key={area}
                  className="border-global-navy/12 border-b py-3 leading-7"
                >
                  {area}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="routing-principles-title">
            <h3
              id="routing-principles-title"
              className="text-global-navy text-xl font-semibold"
            >
              Routing principles
            </h3>
            <ol className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
              {routing.principles.map((principle, index) => (
                <li
                  key={principle}
                  className="border-global-navy/12 grid gap-4 border-b py-4 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
                >
                  <span className="text-heritage-gold text-sm font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="leading-7">{principle}</p>
                </li>
              ))}
            </ol>
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
        <ol className="border-global-navy/12 grid border-t sm:grid-cols-2">
          {privacy.principles.map((principle, index) => (
            <li
              key={principle}
              className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
            >
              <span className="text-heritage-maroon text-sm font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="leading-7">{principle}</p>
            </li>
          ))}
        </ol>
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
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {responseExpectations.items.map((item) => (
              <li
                key={item}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 text-lg leading-8">
            {responseExpectations.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}
