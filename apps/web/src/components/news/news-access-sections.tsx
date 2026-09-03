import { Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { newsContent } from "@/content/news";
import { CheckGrid, NumberedGrid } from "@/components/numbered-grid";

export function MultilingualAccessibilitySection() {
  const { multilingualAccessibility } = newsContent;

  return (
    <Section tone="ivory" aria-labelledby="multilingual-accessibility-title">
      <Container size="wide">
        <SectionHeading
          id="multilingual-accessibility-title"
          eyebrow={multilingualAccessibility.eyebrow}
          title={multilingualAccessibility.title}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {multilingualAccessibility.groups.map((group) => (
            <section
              key={group.title}
              className="border-global-navy/12 border p-6 sm:p-7"
            >
              <h3 className="text-global-navy text-xl font-semibold">
                {group.title}
              </h3>
              <CheckGrid columns={2} items={group.items} />
            </section>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function FutureDiscoverySection() {
  const { discovery } = newsContent;

  return (
    <Section tone="white" aria-labelledby="future-discovery-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <div>
          <SectionHeading
            id="future-discovery-title"
            eyebrow={discovery.eyebrow}
            title={discovery.title}
          />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <section aria-labelledby="discovery-fields-title">
            <h3
              id="discovery-fields-title"
              className="text-global-navy text-xl font-semibold"
            >
              Discovery fields
            </h3>
            <CheckGrid columns={2} items={discovery.discoveryFields} />
          </section>
          <section aria-labelledby="future-article-experience-title">
            <h3
              id="future-article-experience-title"
              className="text-global-navy text-xl font-semibold"
            >
              Article experience
            </h3>
            <CheckGrid columns={2} items={discovery.articleFields} />
          </section>
        </div>
      </Container>
    </Section>
  );
}

export function DistributionSection() {
  const { distribution } = newsContent;

  return (
    <Section tone="navy" aria-labelledby="distribution-title">
      <Container size="wide">
        <SectionHeading
          id="distribution-title"
          eyebrow={distribution.eyebrow}
          title={distribution.title}
          tone="inverse"
        />
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <section aria-labelledby="distribution-channels-title">
            <h3
              id="distribution-channels-title"
              className="text-xl font-semibold text-white"
            >
              Distribution channels
            </h3>
            <CheckGrid columns={2} items={distribution.channels} tone="dark" />
          </section>
          <section aria-labelledby="distribution-principles-title">
            <h3
              id="distribution-principles-title"
              className="text-xl font-semibold text-white"
            >
              Distribution principles
            </h3>
            <NumberedGrid items={distribution.principles} tone="dark" />
          </section>
        </div>
      </Container>
    </Section>
  );
}

export function ContentStatusSection() {
  const { statusModel } = newsContent;

  return (
    <Section tone="ivory" aria-labelledby="content-status-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="content-status-title"
          eyebrow={statusModel.eyebrow}
          title={statusModel.title}
          description={statusModel.description}
        />
        <div className="grid gap-8">
          <section aria-labelledby="internal-statuses-title">
            <h3
              id="internal-statuses-title"
              className="text-global-navy text-xl font-semibold"
            >
              Internal statuses
            </h3>
            <ul className="mt-5 flex flex-wrap gap-3">
              {statusModel.internalStatuses.map((status) => (
                <li
                  key={status}
                  className="border-global-navy/14 rounded-full border px-4 py-2 text-sm leading-6"
                >
                  {status}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="public-statuses-title">
            <h3
              id="public-statuses-title"
              className="text-global-navy text-xl font-semibold"
            >
              Public statuses
            </h3>
            <ul className="mt-5 flex flex-wrap gap-3">
              {statusModel.publicStatuses.map((status) => (
                <li
                  key={status}
                  className="border-heritage-maroon/30 bg-heritage-maroon/6 text-heritage-maroon rounded-full border px-4 py-2 text-sm leading-6 font-semibold"
                >
                  {status}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </Section>
  );
}
