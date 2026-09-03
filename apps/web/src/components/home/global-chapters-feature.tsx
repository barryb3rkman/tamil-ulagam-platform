import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function GlobalChaptersFeature() {
  const { chapters } = homepageContent;
  return (
    <Section tone="navy" aria-labelledby="chapters-title">
      <Container size="wide">
        <div className="grid items-stretch gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center px-0 py-2 lg:px-8 lg:py-12">
            <p className="text-heritage-gold text-eyebrow">
              {chapters.eyebrow}
            </p>
            <h2
              id="chapters-title"
              className="mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl"
            >
              {chapters.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
              {chapters.description}
            </p>
            <div className="mt-9 flex flex-wrap gap-5">
              <LinkButton
                href="/chapters"
                variant="secondary"
                className="hover:text-global-navy border-white text-white hover:bg-white"
              >
                Explore Chapters
              </LinkButton>
              <LinkButton
                href="/contact"
                variant="text"
                className="decoration-heritage-gold hover:text-heritage-gold text-white"
              >
                Start a Chapter Conversation{" "}
                <span aria-hidden="true" className="ml-2">
                  ↗
                </span>
              </LinkButton>
            </div>
          </div>
          <div className="mt-10 min-h-[300px] overflow-hidden lg:mt-0 lg:min-h-[520px]">
            <ImageWithFallback
              asset={images.globalChapters}
              fallbackLabel="Global Tamil chapter network"
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
