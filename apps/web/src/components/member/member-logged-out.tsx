import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import { MemberMark } from "@/components/join/journey-icons";
import { memberLoggedOutContent } from "@/content/member";
import { withReturnTarget } from "@/lib/return-target";

/**
 * The real Member journey, explained plainly, for a logged-out visitor —
 * not an immediate bounce to /signup. "Create account" is primary
 * because Member Registration always requires an account; "Sign in" is
 * offered for a returning visitor. Both carry `next=/join/member` so
 * authentication returns the visitor straight back here.
 */
export function MemberLoggedOut() {
  return (
    <section
      aria-labelledby="member-logged-out-title"
      className="gradient-warm-welcome"
    >
      <Container className="py-16 sm:py-20 lg:py-24">
        <div data-motion-reveal="" className="mx-auto max-w-2xl text-center">
          <span
            aria-hidden="true"
            className="bg-heritage-maroon/10 text-heritage-maroon mx-auto grid size-12 place-items-center rounded-full"
          >
            <MemberMark className="size-6" />
          </span>
          <p className="text-heritage-maroon mt-6 text-xs font-bold tracking-[0.16em] uppercase">
            {memberLoggedOutContent.eyebrow}
          </p>
          <h1
            id="member-logged-out-title"
            className="text-global-navy mt-4 text-4xl font-bold tracking-[-0.02em] text-balance sm:text-5xl"
          >
            {memberLoggedOutContent.title}
          </h1>
          <p className="text-slate mx-auto mt-6 max-w-lg text-lg leading-8">
            {memberLoggedOutContent.description}
          </p>
        </div>

        <ol
          data-motion-group
          className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {memberLoggedOutContent.steps.map((step, index) => (
            <li key={step.title} className="surface-card p-5">
              <span className="text-heritage-maroon text-sm font-bold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-global-navy mt-2 text-base font-bold">
                {step.title}
              </p>
              <p className="text-slate mt-1 text-sm leading-6">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={withReturnTarget("/signup", "/join/member")}
            className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold text-white focus-visible:outline-none"
          >
            Create account
          </Link>
          <Link
            href={withReturnTarget("/login", "/join/member")}
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Sign in
          </Link>
        </div>
      </Container>
    </section>
  );
}
