import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { CollapsibleSection } from "@/components/collapsible-section";
import { newsContent } from "@/content/news";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

export function SourceVerificationSection() {
  const { verification } = newsContent;

  return (
    <Section tone="white" aria-labelledby="source-verification-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="source-verification-title"
          eyebrow={verification.eyebrow}
          title={verification.title}
        />
        <div>
          <p className="text-heritage-maroon text-eyebrow">
            {verification.label}
          </p>
          <NumberedGrid items={verification.items} />
        </div>
      </Container>
    </Section>
  );
}

export function AuthorshipSection() {
  const { authorship } = newsContent;

  return (
    <Section tone="ivory" aria-labelledby="authorship-title">
      <Container size="wide">
        <SectionHeading
          id="authorship-title"
          eyebrow={authorship.eyebrow}
          title={authorship.title}
        />
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="future-attribution-title">
            <h3
              id="future-attribution-title"
              className="text-global-navy text-xl font-semibold"
            >
              Public attribution may include
            </h3>
            <CheckGrid columns={2} items={authorship.mayInclude} />
          </section>
          <section aria-labelledby="attribution-boundaries-title">
            <h3
              id="attribution-boundaries-title"
              className="text-global-navy text-xl font-semibold"
            >
              Clear boundaries for public attribution
            </h3>
            <ul className="border-heritage-maroon/35 mt-5 space-y-4 border-l-2 pl-5">
              {authorship.principles.map((item) => (
                <li key={item} className="text-slate leading-7">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </Section>
  );
}

export function CommunityStoriesSection() {
  const { communityStories } = newsContent;

  return (
    <Section tone="navy" aria-labelledby="community-stories-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="community-stories-title"
          eyebrow={communityStories.eyebrow}
          title={communityStories.title}
          tone="inverse"
        />
        <div>
          <NumberedGrid items={communityStories.items} tone="dark" />
          <p className="border-heritage-gold/55 mt-8 border-l-2 pl-5 text-lg leading-8 text-white/84">
            {communityStories.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}

export function CorrectionsSection() {
  const { corrections } = newsContent;

  return (
    <CollapsibleSection
      eyebrow={corrections.eyebrow}
      title={corrections.title}
      summary={corrections.statement}
    >
      <dl className="divide-global-navy/10 divide-y">
        {corrections.categories.map((category) => (
          <div
            key={category.title}
            className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[12rem_1fr] sm:gap-7"
          >
            <dt className="text-global-navy text-eyebrow">{category.title}</dt>
            <dd className="text-slate leading-7">{category.description}</dd>
          </div>
        ))}
      </dl>
    </CollapsibleSection>
  );
}
