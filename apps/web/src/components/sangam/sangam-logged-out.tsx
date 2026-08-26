import { Container, ImageWithFallback } from "@tamil-ulagam/ui";
import Link from "next/link";

import { joinImages } from "@/config/join-images";
import { sangamLoggedOutContent } from "@/content/sangam";
import { withReturnTarget } from "@/lib/return-target";

import { SangamMark } from "@/components/join/journey-icons";

/**
 * The pre-authentication half of the /join/sangam journey: Sangam Dusk
 * hero + the real sangam-journey-hero.webp asset (never redesigned into
 * a generic image card — D1 brief section 16), then the four-step
 * explanation so a logged-out visitor understands the whole journey
 * before being asked to create an account, per section 20. Real CTAs —
 * not the old "In development" pre-launch pill — carry the visitor's
 * intent to sign in/sign up and back to /join/sangam afterward via the
 * safe `next=` return-target infrastructure from C2.
 */
export function SangamLoggedOut() {
  return (
    <>
      <section
        aria-labelledby="sangam-journey-title"
        className="gradient-sangam-dusk relative overflow-hidden text-white"
      >
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center lg:py-24">
          <div data-motion-reveal="">
            <span
              aria-hidden="true"
              className="bg-heritage-gold/15 text-heritage-gold grid size-12 place-items-center rounded-full"
            >
              <SangamMark className="size-6" />
            </span>
            <p className="text-heritage-gold mt-6 text-xs font-bold tracking-[0.16em] uppercase">
              {sangamLoggedOutContent.eyebrow}
            </p>
            <h1
              id="sangam-journey-title"
              className="mt-4 text-4xl font-bold tracking-[-0.02em] text-balance sm:text-5xl"
            >
              {sangamLoggedOutContent.title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/85">
              {sangamLoggedOutContent.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={withReturnTarget("/signup", "/join/sangam")}
                className="bg-heritage-gold text-deep-navy focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold hover:bg-white focus-visible:outline-none"
              >
                Create account & begin
              </Link>
              <Link
                href={withReturnTarget("/login", "/join/sangam")}
                className="surface-glass focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold focus-visible:outline-none"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="rounded-card overflow-hidden">
            <ImageWithFallback
              asset={joinImages.sangamJourneyHero}
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="aspect-[4/3] w-full"
            />
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="sangam-journey-how-title"
        className="surface-canvas py-16 sm:py-20"
      >
        <Container>
          <h2
            id="sangam-journey-how-title"
            className="text-global-navy text-2xl font-bold tracking-[-0.01em] sm:text-3xl"
          >
            How Sangam registration works
          </h2>
          <p className="text-slate mt-3 max-w-2xl leading-7">
            Tamil Sangams share the same federation foundation as organisations
            — the same verification standard, the same reviewer process — with a
            registration experience built for how Sangams actually operate.
          </p>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sangamLoggedOutContent.steps.map((step, index) => (
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
              href={withReturnTarget("/signup", "/join/sangam")}
              className="bg-global-navy rounded-button hover:bg-deep-navy focus-visible:ring-focus inline-flex min-h-11 items-center px-5 py-2.5 font-semibold text-white focus-visible:outline-none"
            >
              Begin your Sangam&rsquo;s presence
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
