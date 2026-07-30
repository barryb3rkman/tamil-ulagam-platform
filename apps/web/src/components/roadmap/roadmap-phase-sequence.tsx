import {
  Badge,
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { roadmapPhases } from "@/content/roadmap";

export function RoadmapPhaseSequence() {
  return (
    <Section
      id="roadmap-phases"
      tone="ivory"
      className="scroll-mt-24"
      aria-labelledby="roadmap-phases-title"
    >
      <Container size="wide">
        <SectionHeading
          id="roadmap-phases-title"
          eyebrow="COMPLETE PHASE SEQUENCE"
          title="A proposed sequence for building a responsible global platform."
          description="Each phase is directional rather than date-bound. Advancement depends on governance, quality, community need and operational readiness."
        />
        <ol className="border-global-navy/12 divide-global-navy/12 mt-12 border-y">
          {roadmapPhases.map((phase) => (
            <li
              key={phase.id}
              className="grid gap-6 py-9 lg:grid-cols-[7rem_minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-10 lg:py-12"
            >
              <div>
                <span className="text-heritage-gold text-5xl leading-none font-semibold">
                  {phase.number}
                </span>
                <p className="text-heritage-maroon mt-3 text-xs font-semibold tracking-[0.14em] uppercase">
                  {phase.timeframe}
                </p>
              </div>
              <div>
                <Badge tone={phase.status === "current" ? "maroon" : "neutral"}>
                  {phase.statusLabel}
                </Badge>
                <h2 className="text-global-navy mt-5 text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-4xl">
                  {phase.title}
                </h2>
                <p className="text-slate mt-4 text-lg leading-8">
                  {phase.purpose}
                </p>
                {phase.linkedRoutes.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
                    {phase.linkedRoutes.map((link) => (
                      <LinkButton
                        key={link.href}
                        href={link.href}
                        variant="text"
                      >
                        {link.label}
                      </LinkButton>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <h3 className="text-global-navy text-lg font-semibold">
                    Potential outcomes
                  </h3>
                  <ul className="text-charcoal mt-4 space-y-3 leading-7">
                    {phase.capabilities.map((capability) => (
                      <li key={capability} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="bg-heritage-gold mt-3 size-1.5 shrink-0 rounded-full"
                        />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-global-navy/12 border-l pl-5">
                  <h3 className="text-global-navy text-lg font-semibold">
                    Deliberately excluded at this stage
                  </h3>
                  <ul className="text-slate mt-4 space-y-3 leading-7">
                    {phase.deliberatelyExcluded.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
