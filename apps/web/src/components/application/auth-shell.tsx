import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { ParticleField } from "@/components/motion/particle-field";
import { WordReveal } from "@/components/motion/word-reveal";

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  portalLabel = "Secure account access",
  supportingCopy = "One trusted account for Tamil Ulagam membership and federation workspaces.",
}: {
  readonly children: ReactNode;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly portalLabel?: string;
  readonly supportingCopy?: string;
}) {
  return (
    <section className="surface-field grid min-h-[100dvh] content-center px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-[84rem]">
        <div className="mb-5 flex items-center justify-between gap-4 sm:mb-7">
          <Link
            href="/"
            className="focus-visible:ring-focus flex items-center gap-3 rounded-sm"
            aria-label="Tamil Ulagam home"
          >
            <BrandMark className="size-11 shrink-0" />
            <span className="leading-tight">
              <span className="text-fg block text-sm font-bold sm:text-base">
                Tamil Ulagam
              </span>
              <span className="text-fg-muted text-eyebrow-sm block sm:text-xs">
                {portalLabel}
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="border-hairline text-fg hover:border-heritage-gold/55 hover:bg-heritage-gold/10 focus-visible:ring-focus rounded-button motion-control bg-raised hidden min-h-11 items-center border px-4 text-sm font-bold focus-visible:outline-none sm:inline-flex"
          >
            Back to website
          </Link>
        </div>

        <div className="auth-card rounded-large border-hairline grid overflow-hidden border lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <AuthBrandPanel supportingCopy={supportingCopy} />

          <div className="flex items-center p-6 sm:p-9 lg:p-11 xl:p-14">
            <div className="w-full">
              <MobileBrandStrip supportingCopy={supportingCopy} />
              <p className="text-fg-muted text-[0.68rem] font-bold tracking-[0.2em] uppercase">
                {eyebrow}
              </p>
              <h1 className="text-page-title mt-3">
                <WordReveal className="text-rise-aurora" text={title} />
              </h1>
              <p className="text-fg-muted mt-4 max-w-xl leading-7">
                {description}
              </p>
              <div className="border-hairline/10 mt-7 border-t pt-7">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileBrandStrip({
  supportingCopy,
}: {
  readonly supportingCopy: string;
}) {
  return (
    <div className="gradient-aurora rounded-card relative mb-7 overflow-hidden p-5 lg:hidden">
      <span
        aria-hidden="true"
        data-motion-ambient
        className="bg-heritage-gold/20 motion-float pointer-events-none absolute -top-10 -right-8 size-40 rounded-full blur-3xl"
      />
      <div className="relative flex items-center gap-4">
        <BrandMark orbit className="size-14 shrink-0" />
        <div className="min-w-0">
          <p className="font-tamil text-gradient-gold text-lg" lang="ta">
            ஒன்றிணைவோம் · உயர்வோம்
          </p>
          <p className="mt-1 text-xs leading-5 text-white/70">
            {supportingCopy}
          </p>
        </div>
      </div>
    </div>
  );
}

const programmeWords: readonly (readonly [string, string])[] = [
  ["நிகழ்வுகள்", "Events"],
  ["வாய்ப்புகள்", "Opportunities"],
  ["சேவைகள்", "Services"],
  ["சமூகம்", "Community"],
  ["பண்பாடு", "Culture"],
  ["கல்வி", "Education"],
  ["வணிகம்", "Business"],
  ["மருத்துவம்", "Healthcare"],
  ["ஆய்வு", "Research"],
  ["பாரம்பரியம்", "Heritage"],
  ["கூட்டிணைவு", "Partnerships"],
];

function AuthBrandPanel({
  supportingCopy,
}: {
  readonly supportingCopy: string;
}) {
  return (
    <div className="auth-brand-panel relative isolate hidden min-h-[34rem] flex-col justify-between overflow-hidden p-9 lg:flex xl:p-11">
      <ParticleField count={54} />

      <div
        aria-hidden="true"
        data-motion-ambient
        className="bg-heritage-gold/14 motion-float pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
      />

      <div className="relative">
        <p className="text-heritage-gold/85 text-[0.66rem] font-bold tracking-[0.24em] uppercase">
          Tamil Ulagam
        </p>
        <p className="mt-2 text-sm font-semibold text-white/70">
          Global Federation
        </p>
      </div>
      <div className="relative grid place-items-center py-8">
        <span
          aria-hidden="true"
          data-motion-ambient
          className="bg-heritage-gold/22 motion-halo absolute size-56 rounded-full blur-3xl"
        />
        <BrandMark orbit className="relative size-44 xl:size-52" />
      </div>

      <div className="relative">
        <p className="font-tamil text-gradient-gold text-2xl" lang="ta">
          ஒன்றிணைவோம் · உயர்வோம்
        </p>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
          {supportingCopy}
        </p>
        <div
          role="presentation"
          className="marquee-y mt-6 h-[4.25rem] border-t border-white/10 pt-4"
        >
          <div className="marquee-y-track gap-3">
            <ProgrammeColumn />
            <ProgrammeColumn ariaHidden />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgrammeColumn({
  ariaHidden = false,
}: {
  readonly ariaHidden?: boolean;
}) {
  return (
    <ul aria-hidden={ariaHidden || undefined} className="grid shrink-0 gap-3">
      {programmeWords.map(([tamil, english]) => (
        <li key={english} className="flex items-baseline gap-3">
          <span className="font-tamil text-heritage-gold/70 text-sm" lang="ta">
            {tamil}
          </span>
          <span className="text-eyebrow text-white/70">{english}</span>
        </li>
      ))}
    </ul>
  );
}
