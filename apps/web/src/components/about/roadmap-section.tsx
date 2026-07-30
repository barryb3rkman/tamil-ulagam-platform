import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { aboutContent } from "@/content/about";
import { roadmapPhases } from "@/content/roadmap";

export function RoadmapSection() {
  const { roadmap } = aboutContent;

  return (
    <Section tone="ivory" aria-labelledby="about-roadmap-title">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:order-2">
            <div className="aspect-[16/9] overflow-hidden">
              <ImageWithFallback
                asset={images[roadmap.imageKey]}
                fallbackLabel="Long-term development path image"
                sizes="(min-width: 1024px) 56vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="lg:order-1">
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              {roadmap.eyebrow}
            </p>
            <h2
              id="about-roadmap-title"
              className="text-global-navy mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl"
            >
              {roadmap.title}
            </h2>
            <p className="text-slate mt-6 max-w-xl text-lg leading-8">
              {roadmap.description}
            </p>
            <ol className="border-global-navy/12 divide-global-navy/12 mt-8 divide-y border-y">
              {roadmapPhases.map((phase, index) => (
                <li
                  key={phase.id}
                  className="grid gap-4 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-6"
                >
                  <span className="text-heritage-gold text-2xl font-semibold">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-slate text-xs font-semibold tracking-[0.12em] uppercase">
                      Phase {index + 1}
                    </p>
                    <h3 className="text-global-navy mt-1 text-xl font-semibold tracking-[-0.02em]">
                      {phase.title}
                    </h3>
                    <p className="text-slate mt-2 leading-7">{phase.summary}</p>
                  </div>
                </li>
              ))}
            </ol>
            <LinkButton
              href={roadmap.callToAction.href}
              variant="text"
              className="mt-8"
            >
              {roadmap.callToAction.label}
              <span aria-hidden="true" className="ml-2">
                ↗
              </span>
            </LinkButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
