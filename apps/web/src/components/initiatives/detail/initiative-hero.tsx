import { Container, ImageWithFallback, LinkButton } from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import type { InitiativeDetail } from "@/content/initiative-details";
import type { InitiativeEntry } from "@tamil-ulagam/shared";

import { InitiativeBreadcrumbs } from "./initiative-breadcrumbs";

export interface InitiativeHeroProps {
  readonly detail: InitiativeDetail;
  readonly groupTitle: string;
  readonly imageKey: keyof typeof images;
  readonly initiative: InitiativeEntry;
}

const heroPresentation = {
  "human-development": {
    shell: "bg-warm-ivory",
    copy: "text-global-navy",
    imageOrder: "lg:order-2",
    panel: "bg-white border-global-navy/10",
  },
  opportunity: {
    shell: "bg-deep-navy",
    copy: "text-white",
    imageOrder: "lg:order-1",
    panel: "bg-white/6 border-white/20",
  },
  "knowledge-global": {
    shell: "bg-white",
    copy: "text-global-navy",
    imageOrder: "lg:order-2",
    panel: "bg-warm-ivory border-heritage-gold/35",
  },
} as const;

export function InitiativeHero({
  detail,
  groupTitle,
  imageKey,
  initiative,
}: InitiativeHeroProps) {
  const presentation = heroPresentation[detail.layout];
  const isDark = detail.layout === "opportunity";

  return (
    <section className={presentation.shell} aria-labelledby="initiative-title">
      <Container size="wide" className="py-8 sm:py-10 lg:py-14">
        <InitiativeBreadcrumbs currentTitle={initiative.title} />
        <div className="mt-9 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className={presentation.imageOrder}>
            <figure
              className={`border ${presentation.panel} shadow-card overflow-hidden p-2`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <ImageWithFallback
                  asset={images[imageKey]}
                  className="h-full w-full transition-transform duration-500 hover:scale-[1.02]"
                  fallbackLabel={`${initiative.title} initiative image`}
                  priority
                  sizes="(min-width: 1024px) 46vw, 100vw"
                />
              </div>
              <figcaption
                className={`px-2 pt-3 pb-1 text-xs leading-5 ${isDark ? "text-white/72" : "text-slate"}`}
              >
                {detail.conceptStatement}
              </figcaption>
            </figure>
          </div>
          <div
            className={
              detail.layout === "opportunity" ? "lg:order-2" : "lg:order-1"
            }
          >
            <p
              className={`text-sm font-semibold tracking-[0.14em] uppercase ${isDark ? "text-heritage-gold" : "text-heritage-maroon"}`}
            >
              {groupTitle}
            </p>
            <h1
              id="initiative-title"
              className={`font-english mt-6 max-w-xl text-4xl leading-[1.04] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl ${presentation.copy}`}
            >
              {initiative.title}
            </h1>
            <p
              className={`mt-6 max-w-xl text-xl leading-8 font-semibold sm:text-2xl sm:leading-9 ${isDark ? "text-white/92" : "text-charcoal"}`}
            >
              {detail.heroStatement}
            </p>
            <p
              className={`mt-5 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 ${isDark ? "text-white/76" : "text-slate"}`}
            >
              {detail.introduction}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton
                href={detail.primaryCallToAction.href}
                variant={isDark ? "primary" : "primary"}
                className={
                  isDark
                    ? "!text-global-navy hover:bg-warm-ivory bg-white"
                    : undefined
                }
              >
                {detail.primaryCallToAction.label}
              </LinkButton>
              <LinkButton
                href={detail.secondaryCallToAction.href}
                variant="secondary"
                className={
                  isDark
                    ? "hover:text-global-navy border-white text-white hover:bg-white"
                    : undefined
                }
              >
                {detail.secondaryCallToAction.label}
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
