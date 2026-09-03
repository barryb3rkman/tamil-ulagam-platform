import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { initiativeOverviewContent } from "@/content/initiatives-overview";
import { NumeralFeature } from "@/components/numeral-feature";

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
          <NumeralFeature
            tone="dark"
            items={sharedPlatform.foundations.map((foundation) => ({
              title: foundation,
            }))}
          />
        </div>
      </Container>
    </Section>
  );
}
