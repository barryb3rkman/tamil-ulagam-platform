import { Container, ImageWithFallback } from "@tamil-ulagam/ui";
import Link from "next/link";

import { joinImages } from "@/config/join-images";
import { organisationLoggedOutContent } from "@/content/organisation";
import { withReturnTarget } from "@/lib/return-target";

/**
 * The pre-authentication half of the /join/organisation (and /register)
 * journey. Deliberately a different visual register from Sangam Dusk —
 * institution/craft/credibility rather than community/continuity (D2
 * brief section 11): a full-bleed, asymmetrically cropped editorial
 * photograph rather than an image tucked into a rounded card beside a
 * heading, a deep-navy copy panel (not a loud gradient wash across the
 * whole hero), and Federation Night used only as a restrained accent —
 * a soft fade at the image's inner edge, not the section's background.
 */
export function OrganisationLoggedOut() {
  return (
    <>
      <section
        aria-labelledby="organisation-journey-title"
        className="surface-deep"
      >
        <div className="mx-auto grid max-w-[100rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div
            data-motion-reveal=""
            className="relative order-2 min-h-[22rem] overflow-hidden lg:order-1 lg:min-h-[36rem]"
          >
            <ImageWithFallback
              asset={joinImages.organisationJourneyHero}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="h-full w-full object-cover"
              priority
            />
            <div
              aria-hidden="true"
              className="gradient-federation-night lg:to-deep-navy/70 pointer-events-none absolute inset-0 opacity-45 mix-blend-multiply lg:bg-gradient-to-r lg:from-transparent lg:via-transparent"
            />
          </div>
          <div
            data-motion-reveal=""
            className="border-heritage-gold/25 order-1 flex flex-col justify-center border-b px-6 py-14 text-white sm:px-10 sm:py-16 lg:order-2 lg:border-b-0 lg:border-l lg:px-12 lg:py-0 xl:px-16"
          >
            <p className="text-heritage-gold text-xs font-bold tracking-[0.16em] uppercase">
              {organisationLoggedOutContent.eyebrow}
            </p>
            <h1
              id="organisation-journey-title"
              className="mt-4 text-4xl font-bold tracking-[-0.02em] text-balance sm:text-5xl"
            >
              {organisationLoggedOutContent.title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
              {organisationLoggedOutContent.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={withReturnTarget("/signup", "/join/organisation")}
                className="bg-heritage-gold text-deep-navy focus-visible:ring-focus-inverse rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold hover:bg-white focus-visible:outline-none"
              >
                Create account & begin
              </Link>
              <Link
                href={withReturnTarget("/login", "/join/organisation")}
                className="surface-glass focus-visible:ring-focus-inverse rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold focus-visible:outline-none"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="organisation-journey-how-title"
        className="surface-canvas py-16 sm:py-20"
      >
        <Container>
          <h2
            id="organisation-journey-how-title"
            className="text-global-navy text-2xl font-bold tracking-[-0.01em] sm:text-3xl"
          >
            How Organisation registration works
          </h2>
          <p className="text-slate mt-3 max-w-2xl leading-7">
            A federation-reviewed record built for how organisations actually
            operate — education, healthcare, business, nonprofit and community
            institutions alike.
          </p>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {organisationLoggedOutContent.steps.map((step, index) => (
              <li key={step.title} className="surface-card p-6">
                <span className="text-heritage-maroon text-sm font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-global-navy mt-3 text-base font-bold">
                  {step.title}
                </p>
                <p className="text-slate mt-2 text-sm leading-6">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={withReturnTarget("/signup", "/join/organisation")}
              className="bg-global-navy rounded-button hover:bg-deep-navy focus-visible:ring-focus inline-flex min-h-11 items-center px-5 py-2.5 font-semibold text-white focus-visible:outline-none"
            >
              Begin your organisation&rsquo;s registration
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
    </>
  );
}
