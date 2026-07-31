import { Badge, Container, LinkButton } from "@tamil-ulagam/ui";

import { contactContent } from "@/content/contact";

export function ContactHero() {
  const { hero } = contactContent;

  return (
    <section
      aria-labelledby="contact-title"
      className="bg-deep-navy relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="border-heritage-gold/20 absolute top-0 right-[8%] h-40 w-40 border-r border-b"
      />
      <div
        aria-hidden="true"
        className="border-heritage-maroon/45 absolute right-[18%] bottom-0 hidden h-64 w-px border-r lg:block"
      />
      <Container
        size="wide"
        className="relative grid min-h-[min(760px,calc(100svh-5rem))] items-center py-16 sm:py-20 lg:grid-cols-[1.28fr_0.72fr] lg:gap-20 lg:py-24"
      >
        <div className="max-w-5xl">
          <p className="text-heritage-gold text-sm font-semibold tracking-[0.14em] uppercase">
            {hero.eyebrow}
          </p>
          <Badge tone="neutral" className="mt-6">
            {hero.status}
          </Badge>
          <h1
            id="contact-title"
            className="mt-6 max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance text-white sm:text-6xl lg:text-7xl"
          >
            {hero.title}
          </h1>
          <p className="mt-7 max-w-2xl text-[1.06rem] leading-8 text-white/80 sm:text-xl sm:leading-9">
            {hero.description}
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LinkButton
              href={hero.primaryCallToAction.href}
              variant="secondary"
              size="large"
              className="!text-global-navy hover:bg-warm-ivory border-white bg-white"
            >
              {hero.primaryCallToAction.label}
            </LinkButton>
            <LinkButton
              href={hero.secondaryCallToAction.href}
              variant="text"
              size="large"
              className="decoration-heritage-gold hover:text-heritage-gold text-white"
            >
              {hero.secondaryCallToAction.label}
            </LinkButton>
          </div>
          <p className="mt-8 max-w-2xl border-l border-white/24 pl-5 text-sm leading-7 text-white/68">
            {hero.note}
          </p>
        </div>
        <div aria-hidden="true" className="relative hidden h-80 lg:block">
          <div className="border-heritage-gold/35 absolute top-2 right-0 h-52 w-52 border-t border-r" />
          <div className="border-heritage-maroon/60 absolute right-20 bottom-0 h-44 w-44 border-b border-l" />
          <div className="bg-heritage-gold absolute top-1/2 right-36 size-2 rounded-full" />
        </div>
      </Container>
    </section>
  );
}
