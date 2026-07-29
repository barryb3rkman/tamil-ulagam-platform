import { Container, Section } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";

export function VisionMissionSection() {
  const { mission, title, vision } = aboutContent.visionMission;

  return (
    <Section
      id="vision-mission"
      tone="ivory"
      aria-labelledby="vision-mission-title"
      className="scroll-mt-24"
    >
      <Container size="wide">
        <div className="mb-10 flex items-end justify-between gap-6 sm:mb-12">
          <h2
            id="vision-mission-title"
            className="text-global-navy text-4xl leading-tight font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            {title}
          </h2>
          <span
            aria-hidden="true"
            className="bg-heritage-gold mb-2 hidden h-px w-24 sm:block"
          />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-7">
          <article className="bg-heritage-maroon flex min-h-[340px] flex-col justify-between p-8 text-white sm:p-12">
            <div>
              <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
                {vision.label}
              </p>
              <h3 className="mt-8 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
                {vision.title}
              </h3>
            </div>
            <p className="mt-10 text-lg leading-8 text-white/82">
              {vision.supportingLine}
            </p>
          </article>
          <article className="bg-deep-navy flex min-h-[300px] flex-col justify-between p-8 text-white sm:p-12 lg:mt-14">
            <div>
              <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
                {mission.label}
              </p>
              <h3 className="mt-8 text-3xl leading-[1.12] font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
                {mission.title}
              </h3>
            </div>
            <p className="mt-10 text-base leading-7 text-white/74">
              {mission.supportingLine}
            </p>
          </article>
        </div>
      </Container>
    </Section>
  );
}
