import {
  Badge,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

export function RegistrationAttendanceSection() {
  const { registration } = eventsContent;

  return (
    <Section tone="white" aria-labelledby="registration-attendance-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="registration-attendance-title"
          eyebrow={registration.eyebrow}
          title={registration.title}
        />
        <div>
          <p className="text-heritage-maroon text-eyebrow">
            Participation models
          </p>
          <CheckGrid columns={2} items={registration.models} />
          <p className="text-heritage-maroon text-eyebrow mt-9">
            Registration principles
          </p>
          <NumberedGrid items={registration.principles} />
        </div>
      </Container>
    </Section>
  );
}

export function EventPrivacySection() {
  const { privacy } = eventsContent;

  return (
    <Section tone="navy" aria-labelledby="event-privacy-title">
      <Container size="wide">
        <SectionHeading
          id="event-privacy-title"
          eyebrow={privacy.eyebrow}
          title={privacy.title}
          tone="inverse"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <section className="bg-deep-navy/45 border border-white/16 p-6 sm:p-8">
            <h3 className="text-heritage-gold text-2xl font-semibold">
              Public event information may include
            </h3>
            <CheckGrid
              columns={2}
              items={privacy.publicInformation}
              tone="dark"
            />
          </section>
          <section className="bg-deep-navy/45 border border-white/16 p-6 sm:p-8">
            <h3 className="text-heritage-gold text-2xl font-semibold">
              Private attendee information may include
            </h3>
            <CheckGrid
              columns={2}
              items={privacy.privateInformation}
              tone="dark"
            />
          </section>
        </div>
        <div className="border-heritage-gold/55 mt-8 flex flex-col items-start gap-5 border-l-2 pl-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="max-w-3xl text-lg leading-8 text-white/84">
              {privacy.statement}
            </p>
            <p className="mt-3 leading-7 text-white/72">
              {privacy.description}
            </p>
          </div>
          <LinkButton
            href={privacy.callToAction.href}
            variant="text"
            className="decoration-heritage-gold hover:text-heritage-gold shrink-0 text-white"
          >
            {privacy.callToAction.label}
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}

export function ChapterOrganisationEventsSection() {
  const { relationships } = eventsContent;

  return (
    <Section tone="ivory" aria-labelledby="event-relationships-title">
      <Container size="wide">
        <SectionHeading
          id="event-relationships-title"
          eyebrow={relationships.eyebrow}
          title={relationships.title}
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {relationships.groups.map((group) => (
            <section
              key={group.title}
              className="border-global-navy/12 border bg-white p-6 sm:p-8"
            >
              <h3 className="text-global-navy text-2xl font-semibold">
                {group.title}
              </h3>
              <CheckGrid columns={2} items={group.items} />
            </section>
          ))}
        </div>
        <p className="border-heritage-maroon/40 text-slate mt-8 max-w-4xl border-l-2 pl-5 text-lg leading-8">
          {relationships.statement}
        </p>
        <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap">
          {relationships.callToActions.map((callToAction) => (
            <LinkButton
              key={callToAction.href}
              href={callToAction.href}
              variant="text"
            >
              {callToAction.label}
            </LinkButton>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function HybridArchiveSection() {
  const { hybridArchive } = eventsContent;

  return (
    <Section tone="white" aria-labelledby="hybrid-archive-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="hybrid-archive-title"
          eyebrow={hybridArchive.eyebrow}
          title={hybridArchive.title}
        />
        <div>
          <p className="text-heritage-maroon text-eyebrow">
            Participation support
          </p>
          <CheckGrid columns={2} items={hybridArchive.possibilities} />
          <p className="text-heritage-maroon text-eyebrow mt-9">
            Required safeguards
          </p>
          <CheckGrid columns={2} items={hybridArchive.safeguards} />
          <p className="border-heritage-gold mt-8 border-l-2 pl-5 text-lg leading-8">
            {hybridArchive.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}

export function EventStatusSection() {
  const { statusModel } = eventsContent;

  return (
    <Section tone="navy" aria-labelledby="event-status-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="event-status-title"
          eyebrow={statusModel.eyebrow}
          title={statusModel.title}
          tone="inverse"
        />
        <div>
          <h3 className="text-heritage-gold text-eyebrow">Public statuses</h3>
          <ul className="mt-5 flex flex-wrap gap-3">
            {statusModel.publicStatuses.map((status) => (
              <li key={status}>
                <Badge
                  tone="neutral"
                  className="border border-white/24 bg-white/8 px-4 py-3 text-sm text-white"
                >
                  {status}
                </Badge>
              </li>
            ))}
          </ul>
          <h3 className="text-heritage-gold text-eyebrow mt-9">
            Administrative statuses
          </h3>
          <ul className="mt-5 flex flex-wrap gap-3">
            {statusModel.administrativeStatuses.map((status) => (
              <li key={status}>
                <Badge
                  tone="neutral"
                  className="border border-white/24 bg-white/8 px-4 py-3 text-sm text-white"
                >
                  {status}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="border-heritage-gold/55 mt-8 border-l-2 pl-5 leading-7 text-white/80">
            {statusModel.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}

export function EventSafetySection() {
  const { safety } = eventsContent;

  return (
    <Section tone="white" aria-labelledby="event-safety-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="event-safety-title"
          eyebrow={safety.eyebrow}
          title={safety.title}
        />
        <div>
          <CheckGrid columns={2} items={safety.principles} />
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 text-lg leading-8">
            {safety.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}
