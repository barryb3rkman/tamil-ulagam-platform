import {
  Badge,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { tamilIdContent } from "@/content/tamil-id";

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
            <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
              {verification.principles.map((principle, index) => (
                <li
                  key={principle}
                  className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
                >
                  <span className="text-heritage-maroon text-sm font-semibold">
                    0{index + 1}
                  </span>
                  <p className="text-charcoal leading-7">{principle}</p>
                </li>
              ))}
            </ul>
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
        <ol className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2">
          {privacy.principles.map((principle, index) => (
            <li
              key={principle.title}
              className="border-global-navy/12 grid gap-4 border-b py-6 md:grid-cols-[2.5rem_1fr] md:px-7 md:odd:pl-0 md:even:border-l"
            >
              <span className="text-heritage-gold text-lg font-semibold">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-global-navy text-xl font-semibold">
                  {principle.title}
                </h3>
                <p className="text-slate mt-2 leading-7">
                  {principle.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
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
          className="[&>h2]:text-white [&>p]:text-white/74"
        />
        <div>
          <ul className="grid border-t border-white/16 sm:grid-cols-2">
            {access.areas.map((area) => (
              <li
                key={area}
                className="border-b border-white/16 py-4 text-white/84 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {area}
              </li>
            ))}
          </ul>
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
          <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
            {governance.principles.map((principle) => (
              <li
                key={principle}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {principle}
              </li>
            ))}
          </ul>
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
        <ol className="border-global-navy/12 mt-10 grid border-t md:grid-cols-2 xl:grid-cols-3">
          {rollout.phases.map((phase) => (
            <li
              key={phase.number}
              className="border-global-navy/12 border-b py-6 md:px-6 md:odd:pl-0 xl:border-r xl:nth-3:border-r-0 xl:nth-4:border-r-0 xl:nth-4:pl-0"
            >
              <span className="text-heritage-maroon text-sm font-semibold tracking-[0.14em]">
                {phase.number}
              </span>
              <h3 className="text-global-navy mt-3 text-xl font-semibold">
                {phase.title}
              </h3>
              <p className="text-slate mt-3 leading-7">{phase.description}</p>
            </li>
          ))}
        </ol>
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
