import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function WhyTamilUlagamSection() {
  return (
    <Section tone="white" aria-labelledby="why-title">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-20">
          <div className="relative overflow-hidden lg:order-2">
            <div
              aria-hidden="true"
              className="border-heritage-gold absolute -top-4 -right-4 h-24 w-24 border-t-2 border-r-2"
            />
            <ImageWithFallback
              asset={images.whyTamilUlagam}
              fallbackLabel="Why Tamil Ulagam image"
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
          <div className="lg:order-1">
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              WHY TAMIL ULAGAM
            </p>
            <h2
              id="why-title"
              className="text-global-navy mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl"
            >
              {homepageContent.why.title}
            </h2>
            <p className="text-slate mt-6 max-w-xl text-lg leading-8">
              {homepageContent.why.description}
            </p>
            <LinkButton href="/about" variant="text" className="mt-8">
              Why Tamil Ulagam{" "}
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
