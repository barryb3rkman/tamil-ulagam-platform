import { Container, LinkButton } from "@tamil-ulagam/ui";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { ParticleField } from "@/components/motion/particle-field";

export interface PublicHeroAction {
  readonly href: string;
  readonly label: string;
}

export function PublicPageHero({
  aside,
  caption,
  description,
  eyebrow,
  figure,
  headingId,
  primaryAction,
  secondaryAction,
  title,
}: {
  readonly aside?: ReactNode;
  readonly caption?: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly figure?: ReactNode;
  readonly headingId: string;
  readonly primaryAction?: PublicHeroAction;
  readonly secondaryAction?: PublicHeroAction;
  readonly title: string;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="gradient-aurora relative isolate overflow-hidden text-white"
    >
      <ParticleField count={48} />
      <div
        aria-hidden="true"
        data-motion-ambient
        className="bg-heritage-gold/12 motion-float pointer-events-none absolute -top-28 -right-20 size-96 rounded-full blur-3xl"
      />

      <Container
        size="wide"
        className={`relative grid items-center gap-12 py-16 sm:py-20 lg:py-24 ${
          aside
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"
            : figure
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]"
              : ""
        }`}
      >
        <div data-motion-reveal="" className="max-w-3xl">
          <div className="flex items-center gap-3.5">
            <BrandMark className="size-10 shrink-0" />
            <p className="text-heritage-gold/85 text-[0.68rem] font-bold tracking-[0.24em] uppercase">
              {eyebrow}
            </p>
          </div>
          <h1
            id={headingId}
            className="text-display text-gradient-gold mt-5 text-balance"
          >
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl sm:leading-9">
            {description}
          </p>
          {caption ? (
            <p className="border-heritage-gold/30 mt-6 max-w-xl border-l-2 pl-4 text-sm leading-6 text-white/50">
              {caption}
            </p>
          ) : null}
          {primaryAction || secondaryAction ? (
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {primaryAction ? (
                <LinkButton
                  href={primaryAction.href}
                  size="large"
                  className="gradient-gold-leaf text-ink border-0 font-bold shadow-[0_0.75rem_2rem_rgba(214,168,75,0.3)] transition-transform hover:-translate-y-0.5"
                >
                  {primaryAction.label}
                </LinkButton>
              ) : null}
              {secondaryAction ? (
                <LinkButton
                  href={secondaryAction.href}
                  variant="secondary"
                  size="large"
                  className="hover:border-heritage-gold/60 border-white/20 bg-white/[0.06] text-white backdrop-blur-sm hover:bg-white/12 hover:text-white"
                >
                  {secondaryAction.label}
                </LinkButton>
              ) : null}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div className="relative flex justify-center lg:justify-end">
            {aside}
          </div>
        ) : null}
        {!aside && figure ? (
          <div
            aria-hidden="true"
            className="relative hidden text-white/70 lg:block"
          >
            {figure}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
