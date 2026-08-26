"use client";

import {
  isTamilSangamProfile,
  type OrganisationApplication,
} from "@tamil-ulagam/shared";
import { Alert, Container, EmptyState, Skeleton } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { OrganisationEmailVerificationCard } from "@/components/application/organisation-email-verification";
import { RegistrationStatusBadge } from "@/components/application/registration-status-badge";
import { registrationStatusPresentation } from "@/content/enrollment";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { withReturnTarget } from "@/lib/return-target";

/**
 * The V3 Organisation Workspace (D2 brief section 21/22) — identity,
 * review status, official-email verification, recent feedback, a People
 * link, one clear next action. Not a metrics dashboard. Query-param
 * organisation selection (`?organization=<uuid>`), the same
 * static-export-safe pattern the Sangam workspace and C2's People page
 * already use. Reuses `usePlatform().applications` (already fetched,
 * already scoped to the caller's own organisations) rather than a new
 * service call — deliberately excludes any Tamil Sangam, mirroring the
 * Sangam workspace's inverse filter, so the two workspaces never overlap.
 */
export function OrganisationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedOrganisationId = searchParams.get("organization");

  const { applications, currentUser, isHydrated, platformError } =
    usePlatform();

  const myOrganisations = useMemo(
    () =>
      applications.filter(
        (application) =>
          !isTamilSangamProfile(application.registration.categoryProfile),
      ),
    [applications],
  );

  const active: OrganisationApplication | undefined = useMemo(
    () =>
      myOrganisations.find(
        (application) =>
          application.organisation.id === requestedOrganisationId,
      ),
    [myOrganisations, requestedOrganisationId],
  );

  useEffect(() => {
    if (
      isHydrated &&
      !requestedOrganisationId &&
      myOrganisations.length === 1
    ) {
      router.replace(
        `/workspace/organisation?organization=${myOrganisations[0]?.organisation.id}`,
      );
    }
  }, [isHydrated, requestedOrganisationId, myOrganisations, router]);

  if (!isHydrated) {
    return (
      <Container className="py-16 sm:py-20">
        <Skeleton className="h-64 w-full" />
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-global-navy text-2xl font-bold">
            Sign in to view your Organisation Workspace
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={withReturnTarget(
                "/login",
                requestedOrganisationId
                  ? `/workspace/organisation?organization=${requestedOrganisationId}`
                  : "/workspace/organisation",
              )}
              className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  if (platformError) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="info" title="Organisation workspace is not available here">
          {platformError}
        </Alert>
      </Container>
    );
  }

  if (myOrganisations.length === 0) {
    return (
      <Container className="py-16 sm:py-20">
        <EmptyState
          title="You don't manage an organisation yet"
          description="Register your organisation to give it a presence within Tamil Ulagam."
          action={
            <Link
              href="/join/organisation"
              className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
            >
              Register an organisation
            </Link>
          }
        />
      </Container>
    );
  }

  if (!requestedOrganisationId) {
    return (
      <Container className="py-16 sm:py-20">
        <h1 className="text-global-navy text-2xl font-bold">
          Choose an organisation
        </h1>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {myOrganisations.map((application) => (
            <li key={application.organisation.id}>
              <Link
                href={`/workspace/organisation?organization=${application.organisation.id}`}
                className="surface-card motion-card border-global-navy/10 block p-5"
              >
                <p className="text-global-navy font-bold">
                  {application.organisation.name || "Incomplete organisation"}
                </p>
                <p className="text-slate text-sm">
                  {[
                    application.organisation.city,
                    application.organisation.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    );
  }

  if (!active) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="warning" title="You don't manage this organisation">
          Choose one of the organisations you manage instead.
        </Alert>
        <p className="mt-4">
          <Link
            href="/workspace/organisation"
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            View your organisations
          </Link>
        </p>
      </Container>
    );
  }

  const { organisation, registration } = active;
  const presentation = registrationStatusPresentation[registration.status];
  const canEdit =
    registration.status === "draft" || registration.status === "needs_changes";

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
        ORGANISATION
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-global-navy text-3xl font-bold tracking-[-0.01em]">
          {organisation.name || "Your organisation"}
        </h1>
        <RegistrationStatusBadge status={registration.status} />
      </div>
      <p className="text-slate mt-2">
        {[organisation.city, organisation.region, organisation.country]
          .filter(Boolean)
          .join(", ")}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border-global-navy/12 rounded-card border bg-white p-5 sm:p-7">
          <h2 className="text-global-navy text-lg font-bold">
            {presentation.title}
          </h2>
          <p className="text-slate mt-2 leading-6">
            {presentation.description}
          </p>
          {registration.adminFeedback ? (
            <div className="border-heritage-gold/35 bg-heritage-gold/8 rounded-card mt-4 border p-4">
              <p className="text-global-navy text-sm font-bold">
                Review feedback
              </p>
              <p className="text-charcoal mt-1 text-sm leading-6">
                {registration.adminFeedback}
              </p>
            </div>
          ) : null}
          <div className="mt-5">
            {canEdit ? (
              <Link
                href="/join/organisation"
                className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
              >
                {registration.status === "needs_changes"
                  ? "Update registration"
                  : "Continue registration"}
              </Link>
            ) : (
              <Link
                href={`/workspace/organisation/people?organization=${organisation.id}`}
                className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
              >
                Open People
              </Link>
            )}
          </div>
        </section>

        {organisation.officialEmail ? (
          <OrganisationEmailVerificationCard
            organisationId={organisation.id}
            officialEmail={organisation.officialEmail}
            verifiedAt={organisation.officialEmailVerifiedAt}
            verificationSentAt={organisation.officialEmailVerificationSentAt}
            canRequest={canEdit || registration.status === "submitted"}
          />
        ) : null}
      </div>

      {!canEdit ? (
        <p className="text-slate mt-6 text-sm">
          Membership requests for this organisation appear in{" "}
          <Link
            href={`/workspace/organisation/people?organization=${organisation.id}`}
            className="text-global-navy font-semibold underline-offset-4 hover:underline"
          >
            People
          </Link>
          .
        </p>
      ) : null}
    </Container>
  );
}
