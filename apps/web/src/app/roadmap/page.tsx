import { Container, Section } from "@tamil-ulagam/ui";
import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { createPageMetadata } from "@/config/metadata";
import { roadmapPhases } from "@/content/roadmap";

const description =
  "A phased direction for growing from the permanent public website into a responsibly governed global platform.";

export const metadata: Metadata = createPageMetadata(
  "Roadmap",
  description,
  "/roadmap",
);

export default function RoadmapPage() {
  return (
    <>
      <PageHero
        eyebrow="Long-term direction"
        title="Building the platform in deliberate phases"
        description={description}
      />
      <Section tone="white">
        <Container size="narrow">
          <ol className="grid gap-6">
            {roadmapPhases.map((phase, index) => (
              <li
                key={phase.id}
                className="rounded-card border-global-navy/12 bg-warm-ivory relative border p-7 sm:p-9"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="bg-global-navy grid size-9 place-items-center rounded-full text-sm font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <p className="text-heritage-maroon text-sm font-semibold tracking-wide uppercase">
                    {phase.timeframe}
                  </p>
                </div>
                <h2 className="text-global-navy mt-5 text-2xl font-semibold">
                  {phase.title}
                </h2>
                <p className="text-slate mt-3 leading-7">{phase.summary}</p>
                <ul className="text-charcoal mt-5 grid gap-2 text-sm">
                  {phase.capabilities.map((capability) => (
                    <li key={capability} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-heritage-gold mt-2 size-1.5 shrink-0 rounded-full"
                      />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="text-slate mt-8 text-sm leading-6">
            Future phases describe direction, not a launch commitment. Scope and
            timing will be confirmed only after governance, safeguarding,
            operational ownership, and technical requirements are ready.
          </p>
        </Container>
      </Section>
    </>
  );
}
