import Link from "next/link";
import {
  Container,
  ImageWithFallback,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { images, type ImageKey } from "@/config/images";
import { homepageContent } from "@/content/homepage";

export function PillarsSection() {
  return (
    <Section tone="ivory" aria-labelledby="pillars-title">
      <Container size="wide">
        <SectionHeading
          eyebrow="CONNECT · EMPOWER · PRESERVE"
          title="Connect. Empower. Preserve."
          description="A shared direction for a global Tamil community, shaped with care and built for the long term."
        />
        <div
          data-motion-group="stagger"
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {homepageContent.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="motion-card group border-global-navy/10 shadow-card overflow-hidden border bg-white"
            >
              <Link
                href={pillar.href}
                className="focus-visible:ring-focus block h-full focus-visible:outline-none"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <ImageWithFallback
                    asset={images[pillar.imageKey as ImageKey]}
                    fallbackLabel={`${pillar.title} image`}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="motion-card-image h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-7">
                  <p className="text-heritage-maroon text-xs font-semibold tracking-[0.14em] uppercase">
                    0{homepageContent.pillars.indexOf(pillar) + 1}
                  </p>
                  <h3 className="text-global-navy mt-3 text-3xl font-semibold tracking-[-0.03em]">
                    {pillar.title}
                  </h3>
                  <p className="text-slate mt-3 leading-7">
                    {pillar.description}
                  </p>
                  <span className="text-global-navy decoration-heritage-gold mt-6 inline-flex items-center text-sm font-semibold underline decoration-2 underline-offset-4">
                    Explore the direction{" "}
                    <span aria-hidden="true" className="motion-arrow ml-2">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
