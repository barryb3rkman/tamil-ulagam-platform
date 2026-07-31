import {
  Badge,
  Container,
  ImageWithFallback,
  LinkButton,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { newsContent } from "@/content/news";

export function NewsHero() {
  const { hero } = newsContent;

  return (
    <section
      aria-labelledby="news-title"
      className="bg-deep-navy overflow-hidden"
    >
      <div className="grid min-h-[min(820px,calc(100svh-5rem))] lg:grid-cols-[0.76fr_1.24fr]">
        <div className="relative flex items-center overflow-hidden py-16 sm:py-20 lg:py-24">
          <div
            aria-hidden="true"
            className="border-heritage-gold/30 absolute top-0 right-[14%] h-32 w-32 border-r border-b"
          />
          <Container
            size="wide"
            className="relative w-full lg:max-w-none lg:px-12 xl:px-16"
          >
            <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              {hero.eyebrow}
            </p>
            <Badge tone="neutral" className="mt-6">
              {hero.status}
            </Badge>
            <h1
              id="news-title"
              className="mt-6 max-w-3xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance text-white sm:text-6xl lg:text-6xl xl:text-7xl"
            >
              {hero.title}
            </h1>
            <p className="mt-7 max-w-xl text-[1.06rem] leading-8 text-white/80 sm:text-xl sm:leading-9">
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
        <div className="bg-global-navy relative flex min-h-[340px] items-center justify-center overflow-hidden px-5 py-10 sm:min-h-[460px] sm:px-8 lg:min-h-0 lg:px-10">
          <div
            aria-hidden="true"
            className="border-heritage-gold/20 absolute inset-y-0 left-0 w-1/4 border-r"
          />
          <figure className="relative w-full max-w-5xl">
            <div className="overflow-hidden">
              <ImageWithFallback
                asset={images[hero.imageKey]}
                fallbackLabel="Future public newsroom concept representation"
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-4 text-center text-sm leading-6 text-white/68">
              {hero.caption}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
