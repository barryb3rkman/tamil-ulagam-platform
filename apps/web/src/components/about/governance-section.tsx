import {
  Container,
  ImageWithFallback,
  LinkButton,
  Section,
} from "@tamil-ulagam/ui";

import { images } from "@/config/images";
import { aboutContent } from "@/content/about";

export function GovernanceSection() {
  const { governance } = aboutContent;

  return (
    <Section tone="white" aria-labelledby="governance-title">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="aspect-[4/3] overflow-hidden">
              <ImageWithFallback
                asset={images[governance.imageKey]}
                fallbackLabel="Responsible collaboration image"
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="border-global-navy/12 text-slate border-b py-4 text-sm leading-6">
              Responsible collaboration begins with clear expectations and
              accountable participation.
            </p>
          </div>
          <div>
            <p className="text-heritage-maroon text-sm font-semibold tracking-[0.14em] uppercase">
              {governance.eyebrow}
            </p>
            <h2
              id="governance-title"
              className="text-global-navy mt-4 max-w-2xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl"
            >
              {governance.title}
            </h2>
            <p className="text-slate mt-6 max-w-2xl text-lg leading-8">
              {governance.description}
            </p>
            <ol className="border-global-navy/12 divide-global-navy/12 mt-9 divide-y border-y">
              {governance.principles.map((principle, index) => (
                <li
                  key={principle.title}
                  className="grid gap-4 py-6 sm:grid-cols-[2.5rem_1fr] sm:gap-5"
                >
                  <span className="text-heritage-gold text-lg font-semibold">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-global-navy text-lg font-semibold">
                      {principle.title}
                    </h3>
                    <p className="text-slate mt-2 leading-7">
                      {principle.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <LinkButton
              href={governance.callToAction.href}
              variant="text"
              className="mt-8"
            >
              {governance.callToAction.label}
              <span aria-hidden="true" className="ml-2">
                ↗
              </span>
            </LinkButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
