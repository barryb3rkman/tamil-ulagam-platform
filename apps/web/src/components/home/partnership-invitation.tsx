import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function PartnershipInvitation() {
  return (
    <Section tone="white" aria-labelledby="partnership-title">
      <Container size="wide">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="overflow-hidden lg:order-2">
            <ImageWithFallback
              asset={images.partnerships}
              fallbackLabel="Partnership collaboration image"
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
          <div className="lg:order-1">
            <p className="text-heritage-maroon text-eyebrow">PARTNERSHIPS</p>
            <h2
              id="partnership-title"
              className="text-global-navy mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              {homepageContent.partnership.title}
            </h2>
            <p className="text-slate mt-6 max-w-xl text-lg leading-8">
              {homepageContent.partnership.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-5">
              <LinkButton href="/partners">Become a Partner</LinkButton>
              <LinkButton href="/contact" variant="text">
                Contact Tamil Ulagam{" "}
                <span aria-hidden="true" className="ml-2">
                  ↗
                </span>
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
