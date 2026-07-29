import { Container, ImageWithFallback, LinkButton } from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function HomeHero() {
  const { hero } = homepageContent;

  return (
    <section aria-labelledby="home-title" className="bg-deep-navy text-white">
      <div className="grid min-h-[min(860px,calc(100svh-5rem))] lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <div className="relative flex items-center overflow-hidden px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div
            aria-hidden="true"
            className="border-heritage-gold/20 absolute -bottom-16 -left-16 h-56 w-56 rounded-full border"
          />
          <div
            aria-hidden="true"
            className="bg-heritage-gold/60 absolute bottom-10 left-10 h-px w-32"
          />
          <Container className="relative px-0" size="narrow">
            <p className="text-heritage-gold flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold tracking-[0.14em] uppercase">
              <span lang="ta" className="font-tamil text-sm tracking-normal">
                {hero.eyebrowTamil}
              </span>
              <span aria-hidden="true">·</span>
              <span>{hero.eyebrowEnglish}</span>
            </p>
            <h1
              id="home-title"
              className="mt-7 max-w-2xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl"
            >
              {hero.title}
            </h1>
            <p className="mt-8 max-w-lg text-[1.08rem] leading-8 text-white/82 sm:text-xl sm:leading-9">
              {hero.description}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <LinkButton
                href="/about"
                variant="secondary"
                size="large"
                className="text-global-navy hover:bg-warm-ivory hover:text-deep-navy border-white bg-white"
              >
                Explore Our Vision
              </LinkButton>
              <LinkButton
                href="/initiatives"
                variant="text"
                size="large"
                className="decoration-heritage-gold hover:text-heritage-gold text-white"
              >
                Discover Initiatives
              </LinkButton>
            </div>
            <LinkButton
              href="/partners"
              variant="text"
              className="mt-8 text-sm text-white/75 decoration-white/40 hover:text-white"
            >
              Partner With Us{" "}
              <span aria-hidden="true" className="ml-2">
                ↗
              </span>
            </LinkButton>
          </Container>
        </div>
        <div className="relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-0">
          <ImageWithFallback
            asset={images.homeHero}
            fallbackLabel="Tamil Ulagam hero image"
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="from-deep-navy/30 absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
