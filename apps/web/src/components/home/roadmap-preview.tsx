import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { roadmapPhases } from "@/content/roadmap";

export function RoadmapPreview() {
  return (
    <Section tone="white" aria-labelledby="roadmap-title">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-20">
          <div className="lg:sticky lg:top-24">
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              THE ROAD AHEAD
            </p>
            <h2
              id="roadmap-title"
              className="text-global-navy mt-4 max-w-md text-4xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              A considered path to one connected future.
            </h2>
            <p className="text-slate mt-6 max-w-md text-lg leading-8">
              Governance, trust and community needs guide a deliberate
              three-phase path.
            </p>
            <LinkButton href="/roadmap" variant="text" className="mt-8">
              View the Roadmap{" "}
              <span aria-hidden="true" className="ml-2">
                ↗
              </span>
            </LinkButton>
          </div>
          <div className="space-y-4">
            <div className="aspect-[16/7] overflow-hidden">
              <ImageWithFallback
                asset={images.roadmapFuture}
                fallbackLabel="Tamil Ulagam roadmap"
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
            <ol className="divide-global-navy/10 border-global-navy/10 divide-y border-y">
              {roadmapPhases.map((phase, index) => (
                <li
                  key={phase.id}
                  className="grid gap-5 py-9 sm:grid-cols-[5rem_1fr] sm:gap-8"
                >
                  <span className="text-heritage-gold text-4xl leading-none font-semibold">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-global-navy text-2xl font-semibold tracking-[-0.02em]">
                      {phase.title}
                    </h3>
                    <p className="text-slate mt-3 max-w-2xl text-base leading-7">
                      {phase.summary}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
