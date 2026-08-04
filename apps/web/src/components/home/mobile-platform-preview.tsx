import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function MobilePlatformPreview() {
  const { mobile } = homepageContent;
  return (
    <Section tone="ivory" aria-labelledby="mobile-title">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="lg:order-2">
            <ImageWithFallback
              asset={images.mobileAppPreview}
              fallbackLabel="Tamil Ulagam mobile platform visual"
              sizes="(min-width: 1024px) 34vw, 90vw"
              className="mx-auto aspect-[3/4] max-h-[680px] w-full max-w-md object-cover"
            />
          </div>
          <div className="lg:order-1">
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              {mobile.eyebrow}
            </p>
            <h2
              id="mobile-title"
              className="text-global-navy mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl"
            >
              {mobile.title}
            </h2>
            <p className="text-slate mt-6 max-w-xl text-lg leading-8">
              {mobile.description}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {mobile.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm leading-6">
                  <span
                    aria-hidden="true"
                    className="bg-heritage-gold mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <LinkButton href="/roadmap" variant="text" className="mt-8">
              See how the platform will grow{" "}
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
