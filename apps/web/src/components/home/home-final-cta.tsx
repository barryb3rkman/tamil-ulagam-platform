import { Container, ImageWithFallback, LinkButton } from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function HomeFinalCta() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="bg-deep-navy relative overflow-hidden text-white"
    >
      <div className="absolute inset-0">
        <ImageWithFallback
          asset={images.finalCallToAction}
          fallbackLabel="Tamil Ulagam closing vision image"
          sizes="100vw"
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="from-deep-navy via-deep-navy/75 to-deep-navy/15 absolute inset-0 bg-gradient-to-r"
        />
      </div>
      <Container className="relative">
        <div className="flex min-h-[560px] items-center py-24 sm:min-h-[620px]">
          <div className="max-w-2xl">
            <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              THE NEXT CHAPTER
            </p>
            <h2
              id="final-cta-title"
              className="mt-4 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-6xl"
            >
              {homepageContent.finalCta.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
              {homepageContent.finalCta.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <LinkButton
                href="/about"
                variant="secondary"
                size="large"
                className="text-global-navy hover:bg-warm-ivory border-white bg-white"
              >
                Explore Tamil Ulagam
              </LinkButton>
              <LinkButton
                href="/partners"
                variant="text"
                size="large"
                className="decoration-heritage-gold hover:text-heritage-gold text-white"
              >
                Partner With Us
              </LinkButton>
            </div>
            <LinkButton
              href="/contact"
              variant="text"
              className="mt-7 text-sm text-white/75 decoration-white/40 hover:text-white"
            >
              Contact Us{" "}
              <span aria-hidden="true" className="ml-2">
                ↗
              </span>
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
