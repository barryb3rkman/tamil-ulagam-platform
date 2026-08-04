import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images, type ImageKey } from "@/config/images";
import {
  getOverviewInitiative,
  getOverviewInitiatives,
  initiativeOverviewContent,
  initiativeOverviewDetails,
} from "@/content/initiatives-overview";

export function KnowledgeCultureSection() {
  const { knowledgeCultureGlobal } = initiativeOverviewContent;
  const research = getOverviewInitiative(
    knowledgeCultureGlobal.initiativeSlugs[0],
  );
  const supportingInitiatives = getOverviewInitiatives(
    knowledgeCultureGlobal.initiativeSlugs.slice(1),
  );
  const researchDetail = initiativeOverviewDetails[research.slug];

  return (
    <Section tone="ivory" aria-labelledby="knowledge-culture-title">
      <Container size="wide">
        <div className="max-w-4xl">
          <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
            {knowledgeCultureGlobal.eyebrow}
          </p>
          <h2
            id="knowledge-culture-title"
            className="text-global-navy mt-4 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
          >
            {knowledgeCultureGlobal.title}
          </h2>
          <p className="text-slate mt-5 max-w-3xl text-lg leading-8">
            {knowledgeCultureGlobal.description}
          </p>
        </div>
        <article className="border-global-navy/12 mt-12 grid overflow-hidden border bg-white lg:grid-cols-[minmax(0,1.16fr)_minmax(0,0.84fr)]">
          <div className="aspect-[16/10] overflow-hidden">
            <ImageWithFallback
              asset={images[research.imageKey as ImageKey]}
              fallbackLabel={`${research.title} initiative image`}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <h3 className="text-global-navy text-3xl font-semibold tracking-[-0.035em]">
              {research.title}
            </h3>
            <p className="text-slate mt-4 text-lg leading-8">
              {researchDetail.purpose}
            </p>
            <LinkButton
              href={research.href}
              variant="text"
              className="mt-6 self-start"
            >
              Explore {research.title}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </LinkButton>
          </div>
        </article>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {supportingInitiatives.map((initiative) => {
            const detail = initiativeOverviewDetails[initiative.slug];

            return (
              <article
                key={initiative.slug}
                className="border-global-navy/12 overflow-hidden border bg-white"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    asset={images[initiative.imageKey as ImageKey]}
                    fallbackLabel={`${initiative.title} initiative image`}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="text-global-navy text-2xl font-semibold tracking-[-0.025em]">
                    {initiative.title}
                  </h3>
                  <p className="text-slate mt-3 leading-7">{detail.purpose}</p>
                  <LinkButton
                    href={initiative.href}
                    variant="text"
                    className="mt-6"
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
      </Container>
    </Section>
  );
}
