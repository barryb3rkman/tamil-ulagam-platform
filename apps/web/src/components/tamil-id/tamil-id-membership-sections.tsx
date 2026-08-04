import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { tamilIdContent } from "@/content/tamil-id";

export function TamilIdJourney() {
  const { journey } = tamilIdContent;

  return (
    <Section tone="white" aria-labelledby="tamil-id-journey-title">
      <Container size="wide">
        <SectionHeading
          eyebrow={journey.eyebrow}
          title={journey.title}
          description={journey.description}
        />
        <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.14em] uppercase">
          Membership journey
        </p>
        <ol className="border-global-navy/12 mt-5 grid border-t md:grid-cols-2 xl:grid-cols-4">
          {journey.steps.map((step) => (
            <li
              key={step.number}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:nth-4:border-r-0 xl:nth-5:border-r-0 xl:nth-5:pl-0"
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

export function TamilIdCredentialPreview() {
  const { credential } = tamilIdContent;

  return (
    <Section tone="navy" aria-labelledby="tamil-id-credential-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20"
      >
        <SectionHeading
          eyebrow={credential.eyebrow}
          title={credential.title}
          description={credential.description}
          className="[&>h2]:text-white [&>p]:text-white/74"
        />
        <div className="border-heritage-gold/30 bg-deep-navy/45 border p-5 sm:p-8">
          <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
            Credential anatomy
          </p>
          <div className="mt-6 grid border-t border-white/16 sm:grid-cols-2">
            {credential.areas.map((area) => (
              <div
                key={area.label}
                className="border-b border-white/16 py-5 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <p className="text-base font-semibold text-white">
                  {area.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/63">
                  {area.example}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-white/62">
            Illustrative labels show the information hierarchy; they do not
            represent a real member record.
          </p>
        </div>
      </Container>
    </Section>
  );
}
