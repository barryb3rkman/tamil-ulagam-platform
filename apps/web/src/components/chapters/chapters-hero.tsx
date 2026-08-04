import { Container, ImageWithFallback, LinkButton } from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { chaptersContent } from "@/content/chapters";

export function ChaptersHero() {
  const { hero } = chaptersContent;

  return (
    <section
      aria-labelledby="chapters-title"
      className="bg-deep-navy text-white"
    >
      <div className="grid min-h-[min(740px,calc(100svh-5rem))] lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)]">
        <div className="relative flex items-center overflow-hidden px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-20">
          <div
            aria-hidden="true"
            className="border-heritage-gold/28 absolute top-0 right-10 h-32 w-32 border-r border-b"
          />
          <div
            aria-hidden="true"
            className="bg-heritage-maroon absolute bottom-0 left-0 h-28 w-1"
          />
          <Container size="narrow" className="relative px-0">
            <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              {hero.eyebrow}
            </p>
            <h1
              id="chapters-title"
              className="mt-6 max-w-xl text-5xl leading-[0.99] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.35rem]"
            >
              {hero.title}
            </h1>
            <p className="mt-7 max-w-lg text-[1.06rem] leading-8 text-white/80 sm:text-xl sm:leading-9">
              {hero.description}
            </p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <LinkButton
                href={hero.primaryCallToAction.href}
                variant="secondary"
                size="large"
                className="!text-global-navy hover:bg-warm-ivory border-white bg-white"
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
        <div className="bg-global-navy relative flex min-h-[360px] items-center justify-center overflow-hidden px-5 py-10 sm:min-h-[460px] sm:px-8 lg:min-h-0 lg:px-10">
          <div
            aria-hidden="true"
            className="border-heritage-gold/20 absolute inset-y-0 left-0 w-1/4 border-r"
          />
          <div className="relative w-full max-w-5xl overflow-hidden">
            <ImageWithFallback
              asset={images[hero.imageKey]}
              fallbackLabel="Global Tamil chapter network"
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="aspect-[16/9] h-full w-full object-cover"
            />
            <p className="mt-4 text-center text-sm leading-6 text-white/68">
              {hero.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
