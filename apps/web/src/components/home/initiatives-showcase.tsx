import Link from "next/link";
import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { images, type ImageKey } from "@/config/images";
import { homepageContent } from "@/content/homepage";
import { initiatives } from "@/content/initiatives";
import type { InitiativeSlug } from "@/content/initiatives";

type InitiativeTier = "featured" | "medium" | "supporting";

const initiativeBySlug = new Map<InitiativeSlug, (typeof initiatives)[number]>(
  initiatives.map((initiative) => [initiative.slug, initiative]),
);

function selectInitiatives(slugs: readonly InitiativeSlug[]) {
  return slugs.flatMap((slug) => {
    const initiative = initiativeBySlug.get(slug);
    return initiative ? [initiative] : [];
  });
}

function InitiativeCard({
  initiative,
  tier,
}: {
  readonly initiative: (typeof initiatives)[number];
  readonly tier: InitiativeTier;
}) {
  const featured = tier === "featured";
  const columnClass = featured ? "lg:col-span-6" : "lg:col-span-4";

  return (
    <article
      data-testid="initiative-card"
      data-tier={tier}
      className={`group border-global-navy/10 overflow-hidden border bg-white ${featured ? "shadow-card" : ""} ${columnClass}`}
    >
      <Link
        href={initiative.href}
        className="focus-visible:ring-focus block h-full focus-visible:outline-none"
      >
        <div className="aspect-[4/3] overflow-hidden">
          <ImageWithFallback
            asset={images[initiative.imageKey as ImageKey]}
            fallbackLabel={`${initiative.title} initiative image`}
            sizes={
              featured
                ? "(min-width: 1024px) 50vw, 100vw"
                : "(min-width: 1024px) 33vw, 50vw"
            }
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className={featured ? "p-6 sm:p-7" : "p-5 sm:p-6"}>
          <h3
            className={`text-global-navy font-semibold tracking-[-0.025em] ${featured ? "text-2xl" : "text-xl"}`}
          >
            {initiative.title}
          </h3>
          <p className="text-slate mt-3 leading-7">
            {initiative.shortDescription}
          </p>
          <span className="text-global-navy decoration-heritage-gold mt-5 inline-flex text-sm font-semibold underline decoration-2 underline-offset-4">
            Explore vision{" "}
            <span
              aria-hidden="true"
              className="ml-2 transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

function DesktopInitiatives() {
  const { presentation } = homepageContent.initiatives;
  const groups: readonly [InitiativeTier, readonly InitiativeSlug[]][] = [
    ["featured", presentation.featured],
    ["medium", presentation.medium],
    ["supporting", presentation.supporting],
  ];

  return (
    <div
      data-testid="initiative-desktop-grid"
      className="mt-12 hidden grid-cols-1 gap-6 md:grid md:grid-cols-2 lg:grid-cols-12"
    >
      {groups.flatMap(([tier, slugs]) =>
        selectInitiatives(slugs).map((initiative) => (
          <InitiativeCard
            key={initiative.slug}
            initiative={initiative}
            tier={tier}
          />
        )),
      )}
    </div>
  );
}

function MobileInitiatives() {
  const mobileInitiatives = selectInitiatives(
    homepageContent.initiatives.presentation.mobileFeatured,
  );

  return (
    <div
      data-testid="initiative-mobile-grid"
      className="mt-10 grid gap-5 md:hidden"
    >
      {mobileInitiatives.map((initiative, index) => (
        <InitiativeCard
          key={initiative.slug}
          initiative={initiative}
          tier={index < 2 ? "featured" : "medium"}
        />
      ))}
    </div>
  );
}

export function InitiativesShowcase() {
  return (
    <Section
      tone="ivory"
      aria-labelledby="initiatives-title"
      className="py-[clamp(3.75rem,8vw,7rem)]"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow="GLOBAL INITIATIVES"
          title={homepageContent.initiatives.title}
          description={homepageContent.initiatives.description}
        />
        <DesktopInitiatives />
        <MobileInitiatives />
        <LinkButton href="/initiatives" variant="text" className="mt-9">
          Explore All Initiatives{" "}
          <span aria-hidden="true" className="ml-2">
            ↗
          </span>
        </LinkButton>
      </Container>
    </Section>
  );
}
