import { Badge, Container, Section, SectionHeading } from "@tamil-ulagam/ui";

import { newsContent } from "@/content/news";

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
              <ul className="border-global-navy/12 mt-5 border-t">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border-global-navy/12 border-b py-3 leading-7"
                  >
                    {item}
                  </li>
                ))}
              </ul>
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
          <Badge tone="warning" className="mt-6">
            {discovery.status}
          </Badge>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <section aria-labelledby="discovery-fields-title">
            <h3
              id="discovery-fields-title"
              className="text-global-navy text-xl font-semibold"
            >
              Potential future discovery fields
            </h3>
            <ul className="border-global-navy/12 mt-5 border-t">
              {discovery.discoveryFields.map((item) => (
                <li
                  key={item}
                  className="border-global-navy/12 border-b py-3 leading-7"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="future-article-experience-title">
            <h3
              id="future-article-experience-title"
              className="text-global-navy text-xl font-semibold"
            >
              Potential future article experience
            </h3>
            <ul className="border-global-navy/12 mt-5 border-t">
              {discovery.articleFields.map((item) => (
                <li
                  key={item}
                  className="border-global-navy/12 border-b py-3 leading-7"
                >
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

export function DistributionSection() {
  const { distribution } = newsContent;

  return (
    <Section tone="navy" aria-labelledby="distribution-title">
      <Container size="wide">
        <SectionHeading
          id="distribution-title"
          eyebrow={distribution.eyebrow}
          title={distribution.title}
          className="[&>h2]:text-white"
        />
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <section aria-labelledby="distribution-channels-title">
            <h3
              id="distribution-channels-title"
              className="text-xl font-semibold text-white"
            >
              Potential future distribution channels
            </h3>
            <ul className="mt-5 grid border-t border-white/16 sm:grid-cols-2">
              {distribution.channels.map((channel) => (
                <li
                  key={channel}
                  className="border-b border-white/16 py-4 leading-7 text-white/84 sm:px-5 sm:odd:pl-0 sm:even:border-l"
                >
                  {channel}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="distribution-principles-title">
            <h3
              id="distribution-principles-title"
              className="text-xl font-semibold text-white"
            >
              Distribution principles
            </h3>
            <ol className="mt-5 grid border-t border-white/16 sm:grid-cols-2">
              {distribution.principles.map((principle, index) => (
                <li
                  key={principle}
                  className="grid gap-4 border-b border-white/16 py-4 sm:grid-cols-[2rem_1fr] sm:px-5 sm:odd:pl-0 sm:even:border-l"
                >
                  <span className="text-heritage-gold text-sm font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="leading-7 text-white/84">{principle}</p>
                </li>
              ))}
            </ol>
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
              Proposed internal statuses
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
              Proposed public statuses
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
