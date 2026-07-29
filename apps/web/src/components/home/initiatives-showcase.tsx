import Link from "next/link";
import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { InitiativeStatusBadge } from "@/components/initiative-status-badge";
import { images, type ImageKey } from "@/config/images";
import { homepageContent } from "@/content/homepage";
import { initiatives } from "@/content/initiatives";

export function InitiativesShowcase() {
  return (
    <Section tone="ivory" aria-labelledby="initiatives-title">
      <Container>
        <SectionHeading
          eyebrow="GLOBAL INITIATIVES"
          title={homepageContent.initiatives.title}
          description={homepageContent.initiatives.description}
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
          {initiatives.map((initiative, index) => (
            <article
              key={initiative.slug}
              className={
                index < 2
                  ? "group border-global-navy/10 shadow-card overflow-hidden border bg-white lg:col-span-6"
                  : "group border-global-navy/10 overflow-hidden border bg-white lg:col-span-4"
              }
            >
              <Link
                href={initiative.href}
                className="focus-visible:ring-focus block h-full focus-visible:outline-none"
              >
                <div
                  className={
                    index < 2
                      ? "aspect-[4/3] overflow-hidden"
                      : "aspect-[4/3] overflow-hidden"
                  }
                >
                  <ImageWithFallback
                    asset={images[initiative.imageKey as ImageKey]}
                    fallbackLabel={`${initiative.title} initiative image`}
                    sizes={
                      index < 2
                        ? "(min-width: 1024px) 50vw, 100vw"
                        : "(min-width: 1024px) 33vw, 100vw"
                    }
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-global-navy text-2xl font-semibold tracking-[-0.025em]">
                      {initiative.title}
                    </h3>
                    <InitiativeStatusBadge status={initiative.status} />
                  </div>
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
          ))}
        </div>
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
