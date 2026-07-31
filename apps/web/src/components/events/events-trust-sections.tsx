import {
  Badge,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { eventsContent } from "@/content/events";

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
          <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
            Possible future registration models
          </p>
          <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
            {registration.models.map((model) => (
              <li
                key={model}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {model}
              </li>
            ))}
          </ul>
          <p className="text-heritage-maroon mt-9 text-sm font-semibold tracking-[0.14em] uppercase">
            Registration principles
          </p>
          <ol className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
            {registration.principles.map((principle, index) => (
              <li
                key={principle}
                className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7">{principle}</p>
              </li>
            ))}
          </ol>
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
          className="[&>h2]:text-white"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <section className="bg-deep-navy/45 border border-white/16 p-6 sm:p-8">
            <h3 className="text-heritage-gold text-2xl font-semibold">
              Public event information may include
            </h3>
            <ul className="mt-5 grid border-t border-white/16 sm:grid-cols-2">
              {privacy.publicInformation.map((item) => (
                <li
                  key={item}
                  className="border-b border-white/16 py-3 text-sm leading-6 text-white/84 sm:px-4 sm:odd:pl-0 sm:even:border-l"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-deep-navy/45 border border-white/16 p-6 sm:p-8">
            <h3 className="text-heritage-gold text-2xl font-semibold">
              Private attendee information may include
            </h3>
            <ul className="mt-5 grid border-t border-white/16 sm:grid-cols-2">
              {privacy.privateInformation.map((item) => (
                <li
                  key={item}
                  className="border-b border-white/16 py-3 text-sm leading-6 text-white/84 sm:px-4 sm:odd:pl-0 sm:even:border-l"
                >
                  {item}
                </li>
              ))}
            </ul>
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
              <ul className="border-global-navy/12 mt-5 border-t">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border-global-navy/12 border-b py-3 leading-7"
                  >
                    {item}
                  </li>
                ))}
              </ul>
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
          <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
            Potential future support
          </p>
          <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
            {hybridArchive.possibilities.map((item) => (
              <li
                key={item}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="text-heritage-maroon mt-9 text-sm font-semibold tracking-[0.14em] uppercase">
            Required safeguards
          </p>
          <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
            {hybridArchive.safeguards.map((item) => (
              <li
                key={item}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {item}
              </li>
            ))}
          </ul>
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
          className="[&>h2]:text-white"
        />
        <div>
          <h3 className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
            Proposed public statuses
          </h3>
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
          <h3 className="text-heritage-gold mt-9 text-sm font-semibold tracking-[0.14em] uppercase">
            Proposed administrative statuses
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
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {safety.principles.map((principle) => (
              <li
                key={principle}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {principle}
              </li>
            ))}
          </ul>
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 text-lg leading-8">
            {safety.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}
