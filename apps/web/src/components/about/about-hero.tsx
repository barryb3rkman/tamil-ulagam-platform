import { Container, ImageWithFallback, LinkButton } from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { aboutContent } from "@/content/about";

export function AboutHero() {
  const { hero } = aboutContent;

  return (
    <section aria-labelledby="about-title" className="bg-deep-navy text-white">
      <div className="grid min-h-[min(720px,calc(100svh-5rem))] lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
        <div className="relative flex items-center overflow-hidden px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div
            aria-hidden="true"
            className="border-heritage-gold/30 absolute top-0 right-12 h-28 w-28 border-r border-b"
          />
          <div
            aria-hidden="true"
            className="bg-heritage-maroon absolute bottom-12 left-0 h-20 w-1"
          />
          <Container size="narrow" className="relative px-0">
            <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              {hero.eyebrow}
            </p>
            <h1
              id="about-title"
              className="mt-6 max-w-xl text-5xl leading-[0.99] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.25rem]"
            >
              {hero.title}
            </h1>
            <p className="mt-7 max-w-lg text-[1.06rem] leading-8 text-white/80 sm:text-xl sm:leading-9">
              {hero.description}
            </p>
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
          </Container>
        </div>
        <div className="relative min-h-[360px] overflow-hidden sm:min-h-[460px] lg:min-h-0">
          <ImageWithFallback
            asset={images[hero.imageKey]}
            fallbackLabel="Tamil Ulagam About page hero image"
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="from-deep-navy/35 absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
