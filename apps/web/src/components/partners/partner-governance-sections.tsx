import {
  Badge,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { partnersContent } from "@/content/partners";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";
import { NumeralFeature } from "@/components/numeral-feature";

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
        <p className="text-heritage-maroon text-eyebrow mt-7">
          Partnership pathway
        </p>
        <NumeralFeature
          items={pathway.steps.map((step) => ({
            title: step.title,
            description: step.description,
          }))}
        />
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
          <p className="text-heritage-maroon text-eyebrow">
            Due-diligence areas
          </p>
          <NumberedGrid items={dueDiligence.items} />
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
          tone="inverse"
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
              <CheckGrid columns={2} items={group.items} tone="dark" />
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
