import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";
import Link from "next/link";

import { InitiativeStatusBadge } from "@/components/initiative-status-badge";
import {
  getInitiativeEcosystemGroup,
  type InitiativeDetail,
  type InitiativeDetailLayout,
  type InitiativeRelatedEntry,
} from "@/content/initiative-details";
import type { InitiativeEntry } from "@tamil-ulagam/shared";

export function InitiativePurposeSection({
  detail,
  initiative,
}: {
  readonly detail: InitiativeDetail;
  readonly initiative: InitiativeEntry;
}) {
  return (
    <Section tone="white" aria-labelledby="initiative-purpose-title">
      <Container className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <SectionHeading
          eyebrow="WHY THIS MATTERS"
          headingLevel="h2"
          title={detail.whyThisMatters.heading}
        />
        <div>
          <h2 id="initiative-purpose-title" className="sr-only">
            Why {initiative.title} matters
          </h2>
          <p className="text-global-navy text-xl leading-8 font-semibold sm:text-2xl sm:leading-9">
            {detail.whyThisMatters.statement}
          </p>
          <div className="border-global-navy/10 mt-8 border-l-2 pl-5">
            <p className="text-slate text-base leading-7">
              {initiative.description}
            </p>
          </div>
          {detail.safetyNotice ? (
            <p className="border-error/35 bg-error/5 text-charcoal mt-6 border-l-2 px-5 py-4 text-sm leading-6">
              {detail.safetyNotice}
            </p>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

export function InitiativeCapabilitiesSection({
  detail,
  layout,
}: {
  readonly detail: InitiativeDetail;
  readonly layout: InitiativeDetailLayout;
}) {
  const dark = layout === "opportunity";
  const finalRowSize = detail.capabilities.length % 3;

  return (
    <Section
      id="capabilities"
      className="scroll-mt-24"
      tone={dark ? "navy" : "ivory"}
      aria-label="Planned capabilities"
    >
      <Container>
        <SectionHeading
          eyebrow="INTENDED FUTURE EXPERIENCE"
          title="Planned capabilities, introduced in stages."
          description="These are future capability areas, not services currently available through Tamil Ulagam."
          className={dark ? "[&>h2]:text-white [&>p]:text-white/75" : undefined}
        />
        <ol
          aria-label="Capability list"
          className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-6"
        >
          {detail.capabilities.map((capability, index) => (
            <li
              key={capability.title}
              data-capability-card
              className={`border p-6 xl:col-span-2 ${
                finalRowSize === 2 && index === detail.capabilities.length - 2
                  ? "xl:col-start-2"
                  : ""
              } ${
                finalRowSize === 1 && index === detail.capabilities.length - 1
                  ? "xl:col-start-3"
                  : ""
              } ${
                dark
                  ? "bg-deep-navy border-white/18"
                  : "border-global-navy/10 bg-warm-ivory"
              }`}
            >
              <span className="text-heritage-gold text-sm font-semibold tracking-[0.14em]">
                0{index + 1}
              </span>
              <h3
                className={`mt-4 text-xl font-semibold ${dark ? "text-white" : "text-global-navy"}`}
              >
                {capability.title}
              </h3>
              <p
                className={`mt-3 leading-7 ${dark ? "text-white/75" : "text-slate"}`}
              >
                {capability.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function InitiativeAudienceSection({
  detail,
}: {
  readonly detail: InitiativeDetail;
}) {
  return (
    <Section tone="white" spacing="compact" aria-label="Intended audience">
      <Container className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
        <SectionHeading
          eyebrow="WHO IT IS INTENDED TO SERVE"
          title={detail.audienceHeading}
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {detail.intendedAudiences.map((audience) => (
            <li
              key={audience}
              className="border-global-navy/12 text-global-navy flex min-h-12 items-center border-b py-3 font-semibold"
            >
              {audience}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export function InitiativeParticipationSection({
  detail,
  layout,
}: {
  readonly detail: InitiativeDetail;
  readonly layout: InitiativeDetailLayout;
}) {
  const dark = layout === "knowledge-global";

  return (
    <Section
      tone={dark ? "navy" : "ivory"}
      aria-labelledby="participation-title"
    >
      <Container className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p
            className={`text-sm font-semibold tracking-[0.14em] uppercase ${dark ? "text-heritage-gold" : "text-heritage-maroon"}`}
          >
            PARTICIPATION AND PARTNERSHIP
          </p>
          <h2
            id="participation-title"
            className={`font-english mt-4 text-4xl leading-tight font-semibold tracking-[-0.025em] sm:text-5xl ${dark ? "text-white" : "text-global-navy"}`}
          >
            {detail.participationHeading}
          </h2>
          <p
            className={`mt-5 max-w-2xl text-lg leading-8 ${dark ? "text-white/76" : "text-slate"}`}
          >
            {detail.participationStatement}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <LinkButton
            href="/partners"
            variant={dark ? "primary" : "primary"}
            className={
              dark
                ? "!text-global-navy hover:bg-warm-ivory bg-white"
                : undefined
            }
          >
            Explore partnership
          </LinkButton>
          <LinkButton
            href="/contact"
            variant="secondary"
            className={
              dark
                ? "hover:text-global-navy border-white text-white hover:bg-white"
                : undefined
            }
          >
            Contact Tamil Ulagam
          </LinkButton>
          <LinkButton
            href="/roadmap"
            variant="text"
            className={dark ? "hover:text-heritage-gold text-white" : undefined}
          >
            View the roadmap
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}

export function RelatedInitiatives({
  related,
}: {
  readonly related: readonly (InitiativeRelatedEntry & {
    readonly initiative: InitiativeEntry;
  })[];
}) {
  return (
    <Section tone="white" spacing="compact" aria-label="Related initiatives">
      <Container>
        <SectionHeading
          eyebrow="RELATED INITIATIVES"
          title="Connected pathways across one ecosystem."
        />
        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {related.map((entry) => {
            const group = getInitiativeEcosystemGroup(entry.slug);

            return (
              <li key={entry.slug}>
                <Link
                  href={`/initiatives/${entry.slug}`}
                  className="border-global-navy/12 hover:border-heritage-maroon focus-visible:ring-focus block h-full border p-6 transition-colors focus-visible:outline-none"
                >
                  <p className="text-heritage-maroon text-xs font-semibold tracking-[0.14em] uppercase">
                    {group.title}
                  </p>
                  <h3 className="text-global-navy mt-3 text-2xl font-semibold">
                    {entry.initiative.title}
                  </h3>
                  <p className="text-slate mt-3 leading-7">
                    {entry.relationship}
                  </p>
                  <InitiativeStatusBadge status={entry.initiative.status} />
                  <span className="text-global-navy decoration-heritage-gold mt-6 inline-block font-semibold underline decoration-2 underline-offset-4">
                    Explore the vision
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

export interface InitiativeSequenceEntry {
  readonly href: string;
  readonly title: string;
}

export function InitiativePreviousNext({
  next,
  previous,
}: {
  readonly next?: InitiativeSequenceEntry;
  readonly previous?: InitiativeSequenceEntry;
}) {
  return (
    <Section tone="ivory" spacing="compact" aria-label="Initiative sequence">
      <Container className="grid gap-4 sm:grid-cols-2">
        {previous ? (
          <Link
            className="border-global-navy/14 hover:border-heritage-maroon focus-visible:ring-focus border p-5 transition-colors focus-visible:outline-none"
            href={previous.href}
            aria-label={`Previous initiative: ${previous.title}`}
          >
            <span className="text-heritage-maroon text-xs font-semibold tracking-[0.14em] uppercase">
              ← Previous initiative
            </span>
            <span className="text-global-navy mt-2 block text-xl font-semibold">
              {previous.title}
            </span>
          </Link>
        ) : (
          <div aria-hidden="true" className="hidden sm:block" />
        )}
        {next ? (
          <Link
            className="border-global-navy/14 hover:border-heritage-maroon focus-visible:ring-focus border p-5 text-right transition-colors focus-visible:outline-none"
            href={next.href}
            aria-label={`Next initiative: ${next.title}`}
          >
            <span className="text-heritage-maroon text-xs font-semibold tracking-[0.14em] uppercase">
              Next initiative →
            </span>
            <span className="text-global-navy mt-2 block text-xl font-semibold">
              {next.title}
            </span>
          </Link>
        ) : (
          <div aria-hidden="true" className="hidden sm:block" />
        )}
      </Container>
    </Section>
  );
}

export function InitiativeFinalCta({
  detail,
}: {
  readonly detail: InitiativeDetail;
}) {
  return (
    <Section
      tone="navy"
      spacing="generous"
      aria-labelledby="initiative-final-cta-title"
    >
      <Container className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
            BUILDING THE FOUNDATION
          </p>
          <h2
            id="initiative-final-cta-title"
            className="font-english mt-4 max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.025em] text-white sm:text-5xl"
          >
            {detail.finalCtaHeading}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/76">
            Explore the wider initiative ecosystem or begin a conversation about
            the responsible conditions needed for future participation.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <LinkButton
            href="/initiatives"
            className="!text-global-navy hover:bg-warm-ivory bg-white"
          >
            Explore all initiatives
          </LinkButton>
          <LinkButton
            href="/contact"
            variant="secondary"
            className="hover:text-global-navy border-white text-white hover:bg-white"
          >
            Contact Tamil Ulagam
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
