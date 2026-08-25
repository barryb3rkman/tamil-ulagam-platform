import { Container, StatusBadge } from "@tamil-ulagam/ui";
import Link from "next/link";

import { MemberMark } from "./journey-icons";

const steps = [
  {
    title: "Search and select",
    description:
      "Find your organisation or Tamil Sangam already registered with Tamil Ulagam.",
  },
  {
    title: "Specify your relationship",
    description:
      "Tell us how you're affiliated — as a member, not as someone managing the organisation's account.",
  },
  {
    title: "Organisation approves",
    description:
      "The organisation or Sangam reviews and approves the request — membership is never automatic.",
  },
  {
    title: "Membership active",
    description:
      "You're a recognised member, distinct from anyone with administrative access to the organisation's account.",
  },
];

/**
 * A deliberate pre-launch state for the Member journey — states the
 * actual future model (membership/affiliation, explicitly distinct
 * from organisation management permission) rather than a fake form or
 * a generic "Coming Soon" page, per the Phase C1 brief. No dedicated
 * hero image was planned for this journey in the Phase B1 asset plan,
 * so the page leans on typography and the step explainer rather than
 * photography.
 */
export function MemberJourneyPage() {
  return (
    <section
      aria-labelledby="member-journey-title"
      className="surface-canvas py-16 sm:py-20 lg:py-24"
    >
      <Container size="narrow">
        <div data-motion-reveal="" className="text-center">
          <span
            aria-hidden="true"
            className="bg-indigo-depth/10 text-indigo-depth mx-auto grid size-12 place-items-center rounded-full"
          >
            <MemberMark className="size-6" />
          </span>
          <p className="text-heritage-maroon mt-6 text-xs font-bold tracking-[0.16em] uppercase">
            MEMBERSHIP
          </p>
          <h1
            id="member-journey-title"
            className="text-global-navy mt-4 text-4xl font-bold tracking-[-0.02em] text-balance sm:text-5xl"
          >
            Join as a Member
          </h1>
          <p className="text-slate mx-auto mt-6 max-w-xl text-lg leading-8">
            Become part of Tamil Ulagam through a registered organisation or
            Tamil Sangam.
          </p>
          <div className="mt-7 flex justify-center">
            <StatusBadge label="In development" tone="neutral" />
          </div>
        </div>

        <div className="gradient-warm-welcome rounded-large mt-14 p-6 sm:p-10">
          <h2 className="text-global-navy text-xl font-bold">
            How membership will work
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="surface-card p-5">
                <span className="text-heritage-maroon text-sm font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-global-navy mt-2 text-base font-bold">
                  {step.title}
                </p>
                <p className="text-slate mt-2 text-sm leading-6">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link
            href="/contact"
            className="bg-global-navy rounded-button hover:bg-deep-navy focus-visible:ring-focus inline-flex min-h-11 items-center px-5 py-2.5 font-semibold text-white focus-visible:outline-none"
          >
            Get notified when membership opens
          </Link>
          <Link
            href="/join"
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline"
          >
            ← Back to Join Tamil Ulagam
          </Link>
        </div>
      </Container>
    </section>
  );
}
