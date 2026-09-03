import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { tamilIdContent } from "@/content/tamil-id";
import { NumeralFeature } from "@/components/numeral-feature";

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
        <NumeralFeature
          items={journey.steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
        />
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
          tone="inverse"
          className="[&>p]:text-white/74"
        />
        <div className="border-heritage-gold/30 bg-deep-navy/45 border p-5 sm:p-8">
          <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
            Credential anatomy
          </p>
          <div className="motion-pop-group mt-6 grid gap-3 sm:grid-cols-2">
            {credential.areas.map((area) => (
              <div
                key={area.label}
                className="rounded-card motion-lift flex items-start gap-3 border border-white/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur-sm"
              >
                <span
                  aria-hidden="true"
                  className="gradient-gold-leaf text-ink mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold"
                >
                  &#10003;
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">
                    {area.label}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-white/55">
                    {area.example}
                  </span>
                </span>
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
