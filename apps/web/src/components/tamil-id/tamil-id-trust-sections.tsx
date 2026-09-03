import {
  Badge,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { tamilIdContent } from "@/content/tamil-id";
import { CheckGrid } from "@/components/numbered-grid";
import { SequenceSpine } from "@/components/sequence-spine";
import { NumeralFeature } from "@/components/numeral-feature";

function InformationList({
  items,
  title,
  tone,
}: {
  readonly items: readonly string[];
  readonly title: string;
  readonly tone: "private" | "public";
}) {
  return (
    <div
      className={
        tone === "public" ? "bg-white p-6" : "bg-deep-navy p-6 text-white"
      }
    >
      <h3
        className={
          tone === "public"
            ? "text-global-navy text-xl font-semibold"
            : "text-xl font-semibold"
        }
      >
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={
              tone === "public"
                ? "border-global-navy/12 border-b pb-3 leading-6"
                : "border-b border-white/16 pb-3 leading-6 text-white/78"
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TamilIdVerificationSection() {
  const { verification } = tamilIdContent;

  return (
    <Section tone="ivory" aria-labelledby="tamil-id-verification-title">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <SectionHeading
            eyebrow={verification.eyebrow}
            title={verification.title}
            description={verification.description}
          />
          <div>
            <NumeralFeature
              columns={2}
              items={verification.principles.map((principle) => ({
                title: principle,
              }))}
            />
            <div className="border-global-navy/12 mt-8 border p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <p className="text-global-navy font-semibold">
                  {verification.illustrativeUrl}
                </p>
                <p className="text-slate mt-1 text-sm leading-6">
                  {verification.illustrativeUrlLabel}
                </p>
              </div>
              <Badge tone="maroon" className="mt-4 sm:mt-0">
                Intended verification experience
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <InformationList
            title="Possible public verification information"
            items={verification.publicInformation}
            tone="public"
          />
          <InformationList
            title="Information that must remain private"
            items={verification.privateInformation}
            tone="private"
          />
        </div>
      </Container>
    </Section>
  );
}

export function TamilIdPrivacySection() {
  const { privacy } = tamilIdContent;

  return (
    <Section tone="white" aria-labelledby="tamil-id-privacy-title">
      <Container size="wide">
        <SectionHeading
          eyebrow={privacy.eyebrow}
          title={privacy.title}
          description={privacy.description}
        />
        <NumeralFeature
          items={privacy.principles.map((principle) => ({
            title: principle.title,
            description: principle.description,
          }))}
        />
      </Container>
    </Section>
  );
}

export function TamilIdAccessSection() {
  const { access } = tamilIdContent;

  return (
    <Section tone="navy" aria-labelledby="tamil-id-access-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
      >
        <SectionHeading
          eyebrow={access.eyebrow}
          title={access.title}
          description={access.description}
          tone="inverse"
          className="[&>p]:text-white/74"
        />
        <div>
          <CheckGrid columns={2} items={access.areas} tone="dark" />
          <p className="border-heritage-gold/55 mt-7 border-l-2 pl-5 leading-7 text-white/72">
            {access.note}
          </p>
        </div>
      </Container>
    </Section>
  );
}

export function TamilIdGovernanceSection() {
  const { governance } = tamilIdContent;

  return (
    <Section tone="ivory" aria-labelledby="tamil-id-governance-title">
      <Container
        size="wide"
        className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          eyebrow={governance.eyebrow}
          title={governance.title}
          description={governance.description}
        />
        <div>
          <h3 className="text-global-navy text-xl font-semibold">
            Required governance areas
          </h3>
          <CheckGrid columns={2} items={governance.principles} />
          <div className="border-heritage-maroon/25 mt-9 border-l-2 pl-6 sm:pl-8">
            <h3 className="text-global-navy text-xl font-semibold">
              {governance.statesLabel}
            </h3>
            <ul className="mt-5 flex flex-wrap gap-3">
              {governance.states.map((state) => (
                <li
                  key={state}
                  className="border-global-navy/14 text-charcoal bg-white px-3 py-2 text-sm font-semibold"
                >
                  {state}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function TamilIdRolloutSection() {
  const { rollout } = tamilIdContent;

  return (
    <Section tone="white" aria-labelledby="tamil-id-rollout-title">
      <Container size="wide">
        <SectionHeading
          eyebrow={rollout.eyebrow}
          title={rollout.title}
          description={rollout.description}
        />
        <SequenceSpine
          steps={rollout.phases.map((phase) => ({
            marker: phase.number,
            title: phase.title,
            description: phase.description,
          }))}
        />
        <LinkButton
          href={rollout.callToAction.href}
          variant="text"
          className="mt-8"
        >
          {rollout.callToAction.label}
          <span aria-hidden="true" className="ml-2">
            ↗
          </span>
        </LinkButton>
      </Container>
    </Section>
  );
}
