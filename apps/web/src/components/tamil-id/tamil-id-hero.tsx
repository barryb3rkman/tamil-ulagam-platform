import { Container, ImageWithFallback, LinkButton } from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { tamilIdContent } from "@/content/tamil-id";

export function TamilIdHero() {
  const { hero } = tamilIdContent;

  return (
    <section
      aria-labelledby="tamil-id-title"
      className="bg-deep-navy text-white"
    >
      <div className="grid min-h-[min(780px,calc(100svh-5rem))] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
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
              id="tamil-id-title"
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
        <div className="bg-global-navy relative flex min-h-[430px] items-center justify-center overflow-hidden px-8 py-12 sm:min-h-[560px] lg:min-h-0 lg:px-12">
          <div
            aria-hidden="true"
            className="border-heritage-gold/22 absolute inset-y-0 left-0 w-1/3 border-r"
          />
          <div className="relative w-full max-w-[26rem]">
            <ImageWithFallback
              asset={images[hero.imageKey]}
              fallbackLabel="Tamil ID digital membership visual"
              priority
              sizes="(min-width: 1024px) 34vw, (min-width: 640px) 52vw, 78vw"
              className="aspect-[3/4] h-full w-full object-cover shadow-[0_1.5rem_4rem_rgba(0,0,0,0.28)]"
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
