import type { OrganisationApplication } from "@tamil-ulagam/shared";
import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import { RegistrationStatusBadge } from "@/components/application/registration-status-badge";
import { registrationStatusPresentation } from "@/content/enrollment";
import { sangamSuccessContent } from "@/content/sangam";

/**
 * Every non-editable Sangam application state (D1 brief section 22/32):
 * SUBMITTED, UNDER REVIEW, VERIFIED, REJECTED, SUSPENDED — reached both
 * right after a fresh submission (a real "Registration submitted" state,
 * not a bare toast) and on any later visit to /join/sangam while the
 * application is not in draft/needs_changes. needs_changes is NOT
 * handled here — that status stays editable and returns to the wizard.
 */
export function SangamStatusScreen({
  application,
}: {
  readonly application: OrganisationApplication;
}) {
  const { organisation, registration } = application;
  const presentation = registrationStatusPresentation[registration.status];
  const isFreshSubmission =
    registration.status === "submitted" ||
    registration.status === "under_review";

  return (
    <section className="gradient-warm-welcome">
      <Container className="py-16 sm:py-20">
        <div className="surface-elevated mx-auto max-w-2xl p-7 text-center sm:p-10">
          <div className="flex justify-center">
            <RegistrationStatusBadge status={registration.status} />
          </div>
          <h1 className="text-global-navy mt-5 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            {isFreshSubmission
              ? sangamSuccessContent.title
              : presentation.title}
          </h1>
          <p className="text-slate mt-2 text-lg font-semibold">
            {organisation.name || "Your Sangam"}
          </p>
          <p className="text-charcoal mx-auto mt-6 max-w-md leading-7">
            {isFreshSubmission
              ? sangamSuccessContent.body
              : presentation.description}
          </p>
          {registration.adminFeedback ? (
            <div className="border-heritage-gold/35 bg-heritage-gold/8 rounded-card mt-6 border p-5 text-left">
              <p className="text-global-navy font-bold">Review feedback</p>
              <p className="text-charcoal mt-2 leading-6">
                {registration.adminFeedback}
              </p>
            </div>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/workspace/sangam"
              className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-12 items-center px-6 font-semibold text-white focus-visible:outline-none"
            >
              {sangamSuccessContent.workspaceCta}
            </Link>
            <Link
              href="/join"
              className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
            >
              {sangamSuccessContent.browseCta}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
