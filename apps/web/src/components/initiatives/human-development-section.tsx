import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images, type ImageKey } from "@/config/images";
import {
  getOverviewInitiatives,
  initiativeOverviewContent,
  initiativeOverviewDetails,
} from "@/content/initiatives-overview";

export function HumanDevelopmentSection() {
  const { humanDevelopment } = initiativeOverviewContent;
  const featuredInitiatives = getOverviewInitiatives(
    humanDevelopment.initiativeSlugs,
  );

  return (
    <Section tone="white" aria-labelledby="human-development-title">
      <Container size="wide">
        <div className="max-w-3xl">
          <p className="text-heritage-maroon text-eyebrow">
            {humanDevelopment.eyebrow}
          </p>
          <h2
            id="human-development-title"
            className="text-global-navy mt-4 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
          >
            {humanDevelopment.title}
          </h2>
          <p className="text-slate mt-5 max-w-2xl text-lg leading-8">
            {humanDevelopment.description}
          </p>
        </div>
        <div className="mt-12 space-y-12 lg:space-y-20">
          {featuredInitiatives.map((initiative, index) => {
            const detail = initiativeOverviewDetails[initiative.slug];
            const image = (
              <div className="aspect-[4/3] overflow-hidden">
                <ImageWithFallback
                  asset={images[initiative.imageKey as ImageKey]}
                  fallbackLabel={`${initiative.title} initiative image`}
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
            );

            const content = (
              <div className="flex flex-col justify-center py-1 lg:py-8">
                <h3 className="text-global-navy text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl">
                  {initiative.title}
                </h3>
                <p className="text-slate mt-5 text-lg leading-8">
                  {detail.purpose}
                </p>
                <ul className="border-global-navy/12 mt-7 grid divide-y border-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  {detail.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="text-charcoal px-4 py-3 text-sm leading-6 sm:first:pl-0 sm:last:pr-0"
                    >
                      {capability}
                    </li>
                  ))}
                </ul>
                <LinkButton
                  href={initiative.href}
                  variant="text"
                  className="mt-6 self-start"
                >
                  Explore {initiative.title}
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                </LinkButton>
              </div>
            );

            return (
              <article
                key={initiative.slug}
                className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16"
              >
                {index === 0 ? (
                  <>
                    {image}
                    {content}
                  </>
                ) : (
                  <>
                    <div className="lg:order-2">{image}</div>
                    <div className="lg:order-1">{content}</div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
