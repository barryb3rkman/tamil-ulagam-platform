import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { chaptersContent } from "@/content/chapters";

export function ChapterGovernanceSection() {
  const { governance } = chaptersContent;

  return (
    <Section tone="white" aria-labelledby="chapter-governance-title">
      <Container
        size="wide"
        className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20"
      >
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="aspect-[4/3] overflow-hidden">
            <ImageWithFallback
              asset={images[governance.imageKey]}
              fallbackLabel="Responsible chapter collaboration"
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="border-global-navy/12 text-slate border-b py-4 text-sm leading-6">
            Community collaboration visual. It does not represent a confirmed
            organisation relationship.
          </p>
        </div>
        <div>
          <SectionHeading
            eyebrow={governance.eyebrow}
            title={governance.title}
            description={governance.description}
          />
          <p className="text-heritage-maroon mt-7 text-sm font-semibold tracking-[0.14em] uppercase">
            Chapter governance principles
          </p>
          <ol className="border-global-navy/12 divide-global-navy/12 mt-5 divide-y border-y">
            {governance.principles.map((principle, index) => (
              <li
                key={principle.title}
                className="grid gap-4 py-6 sm:grid-cols-[2.5rem_1fr] sm:gap-5"
              >
                <span className="text-heritage-gold text-lg font-semibold">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="text-global-navy text-xl font-semibold">
                    {principle.title}
                  </h3>
                  <p className="text-slate mt-2 leading-7">
                    {principle.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

export function ChapterRelationshipsSection() {
  const { relationships } = chaptersContent;

  return (
    <Section tone="navy" aria-labelledby="chapter-relationships-title">
      <Container size="wide">
        <SectionHeading
          eyebrow={relationships.eyebrow}
          title={relationships.title}
          className="[&>h2]:text-white"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {relationships.groups.map((group) => (
            <div
              key={group.title}
              className="bg-deep-navy/45 border border-white/16 p-6"
            >
              <h3 className="text-heritage-gold text-xl font-semibold">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3 border-t border-white/16 pt-4">
                {group.items.map((item) => (
                  <li key={item} className="leading-7 text-white/80">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-heritage-gold/55 mt-8 flex flex-col items-start gap-5 border-l-2 pl-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-3xl text-lg leading-8 text-white/84">
            {relationships.privacyStatement}
          </p>
          <LinkButton
            href={relationships.callToAction.href}
            variant="text"
            className="decoration-heritage-gold hover:text-heritage-gold shrink-0 text-white"
          >
            {relationships.callToAction.label}
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}

export function ChapterStatusSection() {
  const { statusModel } = chaptersContent;

  return (
    <Section tone="ivory" aria-labelledby="chapter-status-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          eyebrow={statusModel.eyebrow}
          title={statusModel.title}
          description={statusModel.description}
        />
        <div>
          <h2 id="chapter-status-title" className="sr-only">
            Chapter statuses
          </h2>
          <ul className="flex flex-wrap gap-3">
            {statusModel.statuses.map((status) => (
              <li
                key={status}
                className="border-global-navy/14 text-charcoal bg-white px-4 py-3 text-sm font-semibold"
              >
                {status}
              </li>
            ))}
          </ul>
          <p className="border-heritage-maroon/35 text-slate mt-8 border-l-2 pl-5 leading-7">
            Status labels keep chapter recognition and local responsibility
            clear without misrepresenting a location.
          </p>
        </div>
      </Container>
    </Section>
  );
}
