"use client";

import type {
  EligibleOrganisation,
  OrganisationApplication,
} from "@tamil-ulagam/shared";
import { isTamilSangam } from "@tamil-ulagam/shared";
import { Alert, Container, EmptyState, Skeleton } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { OrganisationEmailVerificationCard } from "@/components/application/organisation-email-verification";
import { RegistrationStatusBadge } from "@/components/application/registration-status-badge";
import { organisationLocationLabel } from "@/components/member/organisation-presentation";
import { ModuleAccessStrip } from "@/components/workspace/module-access-strip";
import { registrationStatusPresentation } from "@/content/enrollment";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";
import { useSangamRegistrationService } from "@/features/sangam/use-sangam-registration-service";
import { withReturnTarget } from "@/lib/return-target";

type DataState = "loading" | "loaded" | "error";

/**
 * The minimum coherent Sangam workspace (D1 brief section 23) —
 * identity, review status, official-email verification, recent
 * feedback, a People link, one clear next action. Not a dashboard.
 * Query-param Sangam selection (`?sangam=<uuid>`), matching the same
 * static-export-safe pattern C2's People page already established,
 * for the (architecturally supported, if unusual) case of an account
 * managing more than one Tamil Sangam.
 */
export function SangamWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSangamId = searchParams.get("sangam");

  const { currentUser, isHydrated } = usePlatform();
  const membershipService = useMembershipService();
  const sangamService = useSangamRegistrationService();

  const [managedState, setManagedState] = useState<DataState>("loading");
  const [managedError, setManagedError] = useState("");
  const [managedSangams, setManagedSangams] = useState<
    readonly EligibleOrganisation[]
  >([]);

  const [applicationState, setApplicationState] =
    useState<DataState>("loading");
  const [applicationError, setApplicationError] = useState("");
  const [application, setApplication] =
    useState<OrganisationApplication | null>(null);

  useEffect(() => {
    if (!isHydrated || !currentUser || !membershipService) return;
    let cancelled = false;
    membershipService
      .listMyManagedOrganisations(currentUser.id)
      .then((organisations) => {
        if (cancelled) return;
        setManagedSangams(organisations.filter((org) => isTamilSangam(org)));
        setManagedState("loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setManagedError(
          error instanceof Error
            ? error.message
            : "Your Sangams could not be loaded.",
        );
        setManagedState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [isHydrated, currentUser, membershipService]);

  const activeSangam = useMemo(
    () => managedSangams.find((org) => org.id === requestedSangamId),
    [managedSangams, requestedSangamId],
  );

  useEffect(() => {
    if (
      managedState === "loaded" &&
      !requestedSangamId &&
      managedSangams.length === 1
    ) {
      router.replace(`/workspace/sangam?sangam=${managedSangams[0]?.id}`);
    }
  }, [managedState, requestedSangamId, managedSangams, router]);

  useEffect(() => {
    if (!sangamService || !activeSangam) return;
    let cancelled = false;
    sangamService
      .findByOrganisation(activeSangam.id)
      .then((result) => {
        if (cancelled) return;
        setApplication(result);
        setApplicationState("loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setApplicationError(
          error instanceof Error
            ? error.message
            : "Your Sangam's registration could not be loaded.",
        );
        setApplicationState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [sangamService, activeSangam]);

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
            Sign in to view your Sangam workspace
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={withReturnTarget(
                "/login",
                requestedSangamId
                  ? `/workspace/sangam?sangam=${requestedSangamId}`
                  : "/workspace/sangam",
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

  if (!membershipService || !sangamService) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="info" title="Sangam workspace is not available here">
          Tamil Sangam registration is not configured for this deployment.
        </Alert>
      </Container>
    );
  }

  if (managedState === "loading") {
    return (
      <Container className="py-16 sm:py-20">
        <Skeleton className="h-64 w-full" />
      </Container>
    );
  }

  if (managedState === "error") {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="error" role="alert">
          {managedError}
        </Alert>
      </Container>
    );
  }

  if (managedSangams.length === 0) {
    return (
      <Container className="py-16 sm:py-20">
        <EmptyState
          title="You don't manage a Tamil Sangam yet"
          description="Register your Sangam to give it a presence within Tamil Ulagam."
          action={
            <Link
              href="/join/sangam"
              className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
            >
              Register a Tamil Sangam
            </Link>
          }
        />
      </Container>
    );
  }

  if (!requestedSangamId) {
    return (
      <Container className="py-16 sm:py-20">
        <h1 className="text-global-navy text-2xl font-bold">Choose a Sangam</h1>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {managedSangams.map((sangam) => (
            <li key={sangam.id}>
              <Link
                href={`/workspace/sangam?sangam=${sangam.id}`}
                className="surface-card motion-card border-global-navy/10 block p-5"
              >
                <p className="text-global-navy font-bold">{sangam.name}</p>
                <p className="text-slate text-sm">
                  {organisationLocationLabel(sangam)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    );
  }

  if (!activeSangam) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="warning" title="You don't manage this Sangam">
          Choose one of the Sangams you manage instead.
        </Alert>
        <p className="mt-4">
          <Link
            href="/workspace/sangam"
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            View your Sangams
          </Link>
        </p>
      </Container>
    );
  }

  if (applicationState === "loading") {
    return (
      <Container className="py-16 sm:py-20">
        <Skeleton className="h-64 w-full" />
      </Container>
    );
  }

  if (applicationState === "error" || !application) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="error" role="alert">
          {applicationError || "This Sangam's registration could not be found."}
        </Alert>
      </Container>
    );
  }

  const { organisation, registration } = application;
  const presentation = registrationStatusPresentation[registration.status];
  const canEdit =
    registration.status === "draft" || registration.status === "needs_changes";

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
        TAMIL SANGAM
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-global-navy text-3xl font-bold tracking-[-0.01em]">
          {organisation.name || "Your Sangam"}
        </h1>
        <RegistrationStatusBadge status={registration.status} />
      </div>
      <p className="text-slate mt-2">
        {organisationLocationLabel(activeSangam)}
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
                href="/join/sangam"
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
          Membership requests for this Sangam appear in{" "}
          <Link
            href={`/workspace/organisation/people?organization=${organisation.id}`}
            className="text-global-navy font-semibold underline-offset-4 hover:underline"
          >
            People
          </Link>
          , the same place an organisation manager approves them.
        </p>
      ) : null}

      <ModuleAccessStrip type="sangam" entityId={organisation.id} />
    </Container>
  );
}
