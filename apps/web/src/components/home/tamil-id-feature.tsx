import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function TamilIdFeature() {
  const { tamilId } = homepageContent;
  return (
    <Section
      tone="navy"
      aria-labelledby="tamil-id-title"
      className="overflow-hidden"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="mx-auto w-full max-w-sm lg:order-2">
            <ImageWithFallback
              asset={images.tamilIdShowcase}
              fallbackLabel="Tamil ID digital membership visual"
              sizes="(min-width: 1024px) 30vw, 90vw"
              className="aspect-[3/4] h-full w-full object-cover"
            />
          </div>
          <div className="lg:order-1">
            <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              {tamilId.eyebrow}
            </p>
            <h2
              id="tamil-id-title"
              className="mt-4 max-w-2xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl"
            >
              {tamilId.title}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              {tamilId.description}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {tamilId.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 text-sm leading-6 text-white/82"
                >
                  <span
                    aria-hidden="true"
                    className="bg-heritage-gold mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <LinkButton
              href="/tamil-id"
              variant="secondary"
              className="hover:text-global-navy mt-9 border-white text-white hover:bg-white"
            >
              Explore Tamil ID
            </LinkButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
