import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import { withReturnTarget } from "@/lib/return-target";

import { JourneyMasthead } from "./journey-masthead";

export interface JourneyStep {
  readonly title: string;
  readonly description: string;
}

export function JourneyLanding({
  backHref,
  backLabel,
  description,
  eyebrow,
  primaryLabel,
  returnTo,
  steps,
  stepsDescription,
  stepsTitle,
  title,
}: {
  readonly backHref?: `/${string}`;
  readonly backLabel?: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly primaryLabel: string;
  readonly returnTo: `/${string}`;
  readonly steps: readonly JourneyStep[];
  readonly stepsDescription?: string;
  readonly stepsTitle: string;
  readonly title: string;
}) {
  const headingId = `${returnTo.replace(/\W+/g, "-")}-journey-title`;

  return (
    <section aria-labelledby={headingId} className="surface-page">
      <JourneyMasthead
        eyebrow={eyebrow}
        title={title}
        description={description}
        headingId={headingId}
      />

      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-section-title text-gradient-ink">{stepsTitle}</h2>
          {stepsDescription ? (
            <p className="text-slate mt-3 leading-7">{stepsDescription}</p>
          ) : null}

          <ol data-motion-group className="mt-10 grid gap-0">
            {steps.map((step, index) => {
              const last = index === steps.length - 1;
              return (
                <li
                  key={step.title}
                  className="relative flex gap-5 pb-8 last:pb-0"
                >
                  {!last ? (
                    <span
                      aria-hidden="true"
                      className="from-heritage-gold/45 absolute top-11 bottom-1 left-[1.375rem] w-px bg-gradient-to-b to-transparent"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="border-heritage-gold/40 text-heritage-maroon font-display relative z-10 grid size-11 shrink-0 place-items-center rounded-full border bg-white text-sm font-bold shadow-[0_0.5rem_1.5rem_rgba(214,168,75,0.18)]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 pt-1.5">
                    <p className="text-global-navy text-lg font-bold tracking-[-0.01em]">
                      {step.title}
                    </p>
                    <p className="text-slate mt-1.5 leading-7">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href={withReturnTarget("/signup", returnTo)}
              className="gradient-gold-leaf text-ink focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center px-6 font-bold shadow-[0_0.5rem_1.5rem_rgba(214,168,75,0.3)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none"
            >
              {primaryLabel}
            </Link>
            <Link
              href={withReturnTarget("/login", returnTo)}
              className="border-global-navy/12 text-global-navy hover:border-heritage-gold/55 hover:bg-heritage-gold/8 focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center border bg-white px-6 text-sm font-bold focus-visible:outline-none"
            >
              Sign in
            </Link>
            {backHref && backLabel ? (
              <Link
                href={backHref}
                className="text-slate hover:text-global-navy focus-visible:ring-focus rounded-button inline-flex min-h-12 items-center text-sm font-semibold focus-visible:outline-none"
              >
                {backLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
