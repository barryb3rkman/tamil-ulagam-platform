import {
  Badge,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { partnersContent } from "@/content/partners";

export function PartnershipPathwaySection() {
  const { pathway } = partnersContent;
  return (
    <Section tone="white" aria-labelledby="partnership-pathway-title">
      <Container size="wide">
        <SectionHeading
          id="partnership-pathway-title"
          eyebrow={pathway.eyebrow}
          title={pathway.title}
          description={pathway.description}
        />
        <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.14em] uppercase">
          Partnership pathway
        </p>
        <ol className="border-global-navy/12 mt-5 grid border-t md:grid-cols-2 xl:grid-cols-4">
          {pathway.steps.map((step) => (
            <li
              key={step.number}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:[&:nth-child(4n)]:border-r-0 xl:[&:nth-child(4n+1)]:pl-0"
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

export function DueDiligenceSection() {
  const { dueDiligence } = partnersContent;
  return (
    <Section tone="ivory" aria-labelledby="due-diligence-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="due-diligence-title"
          eyebrow={dueDiligence.eyebrow}
          title={dueDiligence.title}
          description={dueDiligence.description}
        />
        <div>
          <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
            Due-diligence areas
          </p>
          <ol className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
            {dueDiligence.items.map((item, index) => (
              <li
                key={item}
                className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-maroon text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-charcoal leading-7">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

export function GovernanceAndAccessSection() {
  const { governance } = partnersContent;
  return (
    <Section tone="navy" aria-labelledby="partnership-governance-title">
      <Container size="wide">
        <SectionHeading
          id="partnership-governance-title"
          eyebrow={governance.eyebrow}
          title={governance.title}
          className="[&>h2]:text-white"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {governance.groups.map((group) => (
            <section
              key={group.title}
              className="bg-deep-navy/45 border border-white/16 p-6"
            >
              <h3 className="text-heritage-gold text-xl font-semibold">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3 border-t border-white/16 pt-4">
                {group.items.map((item) => (
                  <li key={item} className="leading-7 text-white/80">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="border-heritage-gold/55 mt-8 flex flex-col items-start gap-5 border-l-2 pl-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-3xl text-lg leading-8 text-white/84">
            {governance.privacyStatement}
          </p>
          <LinkButton
            href={governance.callToAction.href}
            variant="text"
            className="decoration-heritage-gold hover:text-heritage-gold shrink-0 text-white"
          >
            {governance.callToAction.label}
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}

export function PartnershipStatusSection() {
  const { statusModel } = partnersContent;
  return (
    <Section tone="white" aria-labelledby="partnership-status-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="partnership-status-title"
          eyebrow={statusModel.eyebrow}
          title={statusModel.title}
          description={statusModel.description}
        />
        <div>
          <ul className="flex flex-wrap gap-3">
            {statusModel.statuses.map((status) => (
              <li key={status}>
                <Badge
                  tone="neutral"
                  className="border-global-navy/14 border px-4 py-3 text-sm"
                >
                  {status}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="border-heritage-maroon/35 text-slate mt-8 border-l-2 pl-5 leading-7">
            {statusModel.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}
