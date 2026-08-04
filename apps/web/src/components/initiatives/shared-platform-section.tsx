import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { initiativeOverviewContent } from "@/content/initiatives-overview";

export function SharedPlatformSection() {
  const { sharedPlatform } = initiativeOverviewContent;

  return (
    <Section
      tone="navy"
      spacing="generous"
      aria-labelledby="shared-platform-title"
    >
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
              {sharedPlatform.eyebrow}
            </p>
            <h2
              id="shared-platform-title"
              className="mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
            >
              {sharedPlatform.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/76">
              {sharedPlatform.description}
            </p>
            <LinkButton
              href={sharedPlatform.callToAction.href}
              variant="secondary"
              className="hover:text-deep-navy mt-9 border-white text-white hover:bg-white"
            >
              {sharedPlatform.callToAction.label}
            </LinkButton>
          </div>
          <ol className="grid divide-y border-y border-white/16 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {sharedPlatform.foundations.map((foundation, index) => (
              <li
                key={foundation}
                className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-5 border-white/16 py-7 sm:grid-cols-[2.75rem_1fr] sm:gap-4 sm:p-8 odd:sm:border-b"
              >
                <span className="border-heritage-gold/60 text-heritage-gold grid size-10 place-items-center rounded-full border text-sm font-semibold sm:size-auto sm:border-0 sm:text-lg">
                  0{index + 1}
                </span>
                <p className="text-base leading-7 font-semibold text-white/92 sm:text-lg sm:leading-normal">
                  {foundation}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
