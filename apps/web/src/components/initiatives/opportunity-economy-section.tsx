import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { InitiativeStatusBadge } from "@/components/initiative-status-badge";
import { images, type ImageKey } from "@/config/images";
import {
  getOverviewInitiative,
  getOverviewInitiatives,
  initiativeOverviewContent,
  initiativeOverviewDetails,
} from "@/content/initiatives-overview";

export function OpportunityEconomySection() {
  const { opportunityEconomy } = initiativeOverviewContent;
  const business = getOverviewInitiative(opportunityEconomy.initiativeSlugs[0]);
  const supportingInitiatives = getOverviewInitiatives(
    opportunityEconomy.initiativeSlugs.slice(1),
  );
  const businessDetail = initiativeOverviewDetails[business.slug];

  return (
    <Section tone="navy" aria-labelledby="opportunity-economy-title">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              {opportunityEconomy.eyebrow}
            </p>
            <h2
              id="opportunity-economy-title"
              className="mt-4 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              {opportunityEconomy.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/76">
              {opportunityEconomy.description}
            </p>
          </div>
          <div className="space-y-8">
            <article className="border-heritage-gold/30 text-charcoal overflow-hidden border bg-white">
              <div className="aspect-[16/9] overflow-hidden">
                <ImageWithFallback
                  asset={images[business.imageKey as ImageKey]}
                  fallbackLabel={`${business.title} initiative image`}
                  sizes="(min-width: 1024px) 54vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-7 sm:p-9">
                <InitiativeStatusBadge status={business.status} />
                <h3 className="text-global-navy mt-5 text-3xl font-semibold tracking-[-0.035em]">
                  {business.title}
                </h3>
                <p className="text-slate mt-4 max-w-2xl text-lg leading-8">
                  {businessDetail.purpose}
                </p>
                <p className="text-slate mt-5 text-sm leading-6 italic">
                  {businessDetail.availabilityStatement}
                </p>
                <LinkButton
                  href={business.href}
                  variant="text"
                  className="mt-6"
                >
                  Explore {business.title}
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                </LinkButton>
              </div>
            </article>
            <div className="grid gap-6 md:grid-cols-2">
              {supportingInitiatives.map((initiative) => {
                const detail = initiativeOverviewDetails[initiative.slug];

                return (
                  <article
                    key={initiative.slug}
                    className="overflow-hidden border border-white/20 bg-white/6"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <ImageWithFallback
                        asset={images[initiative.imageKey as ImageKey]}
                        fallbackLabel={`${initiative.title} initiative image`}
                        sizes="(min-width: 1024px) 28vw, 100vw"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 sm:p-7">
                      <InitiativeStatusBadge status={initiative.status} />
                      <h3 className="mt-5 text-2xl font-semibold tracking-[-0.025em]">
                        {initiative.title}
                      </h3>
                      <p className="mt-3 leading-7 text-white/76">
                        {detail.purpose}
                      </p>
                      <p className="mt-5 text-sm leading-6 text-white/62 italic">
                        {detail.availabilityStatement}
                      </p>
                      <LinkButton
                        href={initiative.href}
                        variant="text"
                        className="decoration-heritage-gold hover:text-heritage-gold mt-6 text-white"
                      >
                        Explore {initiative.title}
                        <span aria-hidden="true" className="ml-2">
                          →
                        </span>
                      </LinkButton>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
