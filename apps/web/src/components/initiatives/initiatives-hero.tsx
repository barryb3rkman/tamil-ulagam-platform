import {
  Badge,
  Container,
  ImageWithFallback,
  LinkButton,
} from "@tamil-ulagam/ui";

import { images, type ImageKey } from "@/config/images";
import {
  getOverviewInitiatives,
  initiativeOverviewContent,
} from "@/content/initiatives-overview";

export function InitiativesHero() {
  const { hero } = initiativeOverviewContent;
  const montageInitiatives = getOverviewInitiatives(hero.montageSlugs);

  return (
    <section
      aria-labelledby="initiatives-title"
      className="bg-deep-navy overflow-hidden text-white"
    >
      <Container size="wide" className="relative py-14 sm:py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="border-heritage-gold/30 absolute top-0 right-[8%] h-28 w-28 border-r border-b"
        />
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(24rem,0.85fr)] lg:gap-16">
          <div className="relative z-10 max-w-3xl">
            <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              {hero.eyebrow}
            </p>
            <h1
              id="initiatives-title"
              className="mt-6 text-5xl leading-[0.99] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.5rem]"
            >
              {hero.title}
            </h1>
            <p className="mt-7 max-w-2xl text-[1.06rem] leading-8 text-white/80 sm:text-xl sm:leading-9">
              {hero.description}
            </p>
            <Badge
              tone="warning"
              className="bg-heritage-gold/15 text-heritage-gold mt-7 text-sm"
            >
              {hero.status}
            </Badge>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <LinkButton
                href={hero.primaryCallToAction.href}
                variant="secondary"
                size="large"
                className="text-global-navy hover:bg-warm-ivory hover:text-deep-navy border-white bg-white"
              >
                {hero.primaryCallToAction.label}
              </LinkButton>
              <LinkButton
                href={hero.secondaryCallToAction.href}
                variant="text"
                size="large"
                className="decoration-heritage-gold hover:text-heritage-gold text-white"
              >
                {hero.secondaryCallToAction.label}
              </LinkButton>
            </div>
          </div>
          <div className="grid grid-cols-[1.12fr_0.88fr] items-end gap-4 sm:gap-6">
            {montageInitiatives.map((initiative, index) => (
              <figure
                key={initiative.slug}
                className={index === 1 ? "mb-8 sm:mb-14" : ""}
              >
                <div className="border-heritage-gold/35 aspect-[4/3] overflow-hidden border">
                  <ImageWithFallback
                    asset={images[initiative.imageKey as ImageKey]}
                    fallbackLabel={`${initiative.title} initiative image`}
                    priority
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="text-heritage-gold mt-3 text-xs font-semibold tracking-[0.12em] uppercase">
                  {initiative.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
