import { Container, LinkButton, Section } from "@tamil-ulagam/ui";

import { aboutContent } from "@/content/about";

export function EcosystemSection() {
  const { ecosystem } = aboutContent;

  return (
    <Section
      tone="navy"
      aria-labelledby="ecosystem-title"
      className="overflow-hidden"
    >
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-heritage-gold text-eyebrow">
              {ecosystem.eyebrow}
            </p>
            <h2
              id="ecosystem-title"
              className="mt-4 max-w-xl text-4xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-5xl"
            >
              {ecosystem.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/76">
              {ecosystem.description}
            </p>
            <LinkButton
              href={ecosystem.callToAction.href}
              variant="secondary"
              className="hover:text-global-navy mt-9 border-white text-white hover:bg-white"
            >
              {ecosystem.callToAction.label}
            </LinkButton>
          </div>
          <div className="grid divide-y divide-white/16 border-y border-white/16 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {ecosystem.groups.map((group) => (
              <article key={group.title} className="p-7 sm:p-9 lg:min-h-80">
                <h3 className="text-heritage-gold text-2xl font-semibold tracking-[-0.02em]">
                  {group.title}
                </h3>
                <ul className="mt-6 space-y-3 text-sm leading-6 text-white/78">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-heritage-gold mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
