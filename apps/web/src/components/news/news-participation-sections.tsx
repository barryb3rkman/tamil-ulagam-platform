import {
  Container,
  LinkButton,
  Section,
  SectionHeading,
} from "@tamil-ulagam/ui";

import { newsContent } from "@/content/news";

export function NewsroomReadinessSection() {
  const { readiness } = newsContent;

  return (
    <Section tone="white" aria-labelledby="newsroom-readiness-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="newsroom-readiness-title"
          eyebrow={readiness.eyebrow}
          title={readiness.title}
        />
        <div>
          <ol className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {readiness.items.map((item, index) => (
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
          <p className="border-heritage-maroon/40 text-slate mt-8 border-l-2 pl-5 text-lg leading-8">
            {readiness.statement}
          </p>
          <LinkButton
            href={readiness.callToAction.href}
            variant="text"
            className="mt-7"
          >
            {readiness.callToAction.label}
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}

export function NewsInterestSection() {
  const { interest } = newsContent;

  return (
    <Section tone="ivory" aria-labelledby="news-interest-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20"
      >
        <SectionHeading
          id="news-interest-title"
          eyebrow={interest.eyebrow}
          title={interest.title}
          description={interest.description}
        />
        <div>
          <ul className="border-global-navy/12 grid border-t sm:grid-cols-2">
            {interest.areas.map((area) => (
              <li
                key={area}
                className="border-global-navy/12 border-b py-4 leading-7 sm:px-5 sm:odd:pl-0 sm:even:border-l"
              >
                {area}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton href={interest.primaryCallToAction.href} size="large">
              {interest.primaryCallToAction.label}
            </LinkButton>
            <LinkButton
              href={interest.secondaryCallToAction.href}
              variant="secondary"
              size="large"
            >
              {interest.secondaryCallToAction.label}
            </LinkButton>
          </div>
          <LinkButton
            href={interest.textCallToAction.href}
            variant="text"
            className="mt-6"
          >
            {interest.textCallToAction.label}
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}

export function NewsFaq() {
  return (
    <Section tone="white" aria-labelledby="news-faq-title">
      <Container
        size="wide"
        className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20"
      >
        <SectionHeading
          id="news-faq-title"
          eyebrow="FREQUENTLY ASKED QUESTIONS"
          title="Clear answers about Tamil Ulagam publishing."
        />
        <dl className="border-global-navy/12 divide-global-navy/12 border-y">
          {newsContent.faqs.map((faq) => (
            <div key={faq.title} className="py-6">
              <dt className="text-global-navy text-xl font-semibold">
                {faq.title}
              </dt>
              <dd className="text-slate mt-3 max-w-3xl leading-7">
                {faq.description}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

export function NewsFinalCta() {
  const { finalCallToAction } = newsContent;

  return (
    <Section
      tone="navy"
      spacing="generous"
      aria-labelledby="news-final-cta-title"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="border-heritage-gold/25 absolute top-0 right-[10%] h-36 w-36 border-r border-b"
      />
      <Container size="wide" className="relative">
        <div className="max-w-4xl">
          <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
            {finalCallToAction.eyebrow}
          </p>
          <h2
            id="news-final-cta-title"
            className="mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance text-white sm:text-5xl lg:text-6xl"
          >
            {finalCallToAction.title}
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76">
            {finalCallToAction.description}
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href={finalCallToAction.primaryCallToAction.href}
              variant="secondary"
              size="large"
              className="!text-global-navy hover:bg-warm-ivory border-white bg-white"
            >
              {finalCallToAction.primaryCallToAction.label}
            </LinkButton>
            <LinkButton
              href={finalCallToAction.secondaryCallToAction.href}
              variant="text"
              size="large"
              className="decoration-heritage-gold hover:text-heritage-gold text-white"
            >
              {finalCallToAction.secondaryCallToAction.label}
            </LinkButton>
          </div>
          <LinkButton
            href={finalCallToAction.textCallToAction.href}
            variant="text"
            className="mt-7 text-sm text-white/72 decoration-white/40 hover:text-white"
          >
            {finalCallToAction.textCallToAction.label}
            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
