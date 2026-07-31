import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { newsContent } from "@/content/news";

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
          <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
            {verification.label}
          </p>
          <ol className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
            {verification.items.map((item, index) => (
              <li
                key={item}
                className="border-global-navy/12 grid gap-4 border-b py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7">{item}</p>
              </li>
            ))}
          </ol>
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
              Future public attribution may include
            </h3>
            <ul className="border-global-navy/12 mt-5 grid border-t sm:grid-cols-2">
              {authorship.mayInclude.map((item) => (
                <li
                  key={item}
                  className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
                >
                  {item}
                </li>
              ))}
            </ul>
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
          className="[&>h2]:text-white"
        />
        <div>
          <ol className="grid border-t border-white/16 sm:grid-cols-2">
            {communityStories.items.map((item, index) => (
              <li
                key={item}
                className="grid gap-4 border-b border-white/16 py-5 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                <span className="text-heritage-gold text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-7 text-white/84">{item}</p>
              </li>
            ))}
          </ol>
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
    <Section tone="white" aria-labelledby="corrections-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20"
      >
        <SectionHeading
          id="corrections-title"
          eyebrow={corrections.eyebrow}
          title={corrections.title}
        />
        <div>
          <dl className="border-global-navy/12 divide-global-navy/12 border-y">
            {corrections.categories.map((category) => (
              <div
                key={category.title}
                className="grid gap-3 py-6 sm:grid-cols-[12rem_1fr] sm:gap-7"
              >
                <dt className="text-heritage-maroon text-sm font-semibold tracking-[0.12em] uppercase">
                  {category.title}
                </dt>
                <dd className="text-slate leading-7">{category.description}</dd>
              </div>
            ))}
          </dl>
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 text-lg leading-8">
            {corrections.statement}
          </p>
        </div>
      </Container>
    </Section>
  );
}
