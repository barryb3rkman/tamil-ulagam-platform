"use client";

import type {
  EligibleOrganisation,
  OrganisationApplication,
} from "@tamil-ulagam/shared";
import { isTamilSangam } from "@tamil-ulagam/shared";
import { Alert, Container, EmptyState } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { OrganisationEmailVerificationCard } from "@/components/application/organisation-email-verification";
import { RegistrationStatusBadge } from "@/components/application/registration-status-badge";
import { organisationLocationLabel } from "@/components/member/organisation-presentation";
import {
  ContactGlyph,
  PeopleGlyph,
  StatusGlyph,
} from "@/components/workspace/panel-glyphs";
import {
  panelActionClassName,
  WorkspaceMasthead,
  WorkspacePanel,
  workspacePrimaryActionClassName,
  workspaceSecondaryActionClassName,
  WorkspaceSectionHeading,
  type WorkspaceStat,
} from "@/components/workspace/workspace-overview-primitives";
import { WorkspaceSkeleton } from "@/components/workspace/workspace-skeleton";
import { registrationStatusPresentation } from "@/content/enrollment";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";
import { useSangamRegistrationService } from "@/features/sangam/use-sangam-registration-service";
import { useWorkspacePeopleStats } from "@/features/workspace/use-workspace-people-stats";
import { withReturnTarget } from "@/lib/return-target";

type DataState = "loading" | "loaded" | "error";

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

  const peopleStats = useWorkspacePeopleStats(activeSangam?.id ?? null);

  if (!isHydrated) {
    return <WorkspaceSkeleton />;
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
    return <WorkspaceSkeleton />;
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
    return <WorkspaceSkeleton />;
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

  const peopleHref = `/workspace/organisation/people?organization=${organisation.id}`;
  const stats: WorkspaceStat[] =
    peopleStats.status === "loaded"
      ? [
          { label: "Members", value: peopleStats.approvedCount },
          {
            label: "Pending requests",
            value: peopleStats.pendingCount,
            tone: peopleStats.pendingCount > 0 ? "attention" : "default",
          },
          { label: "Managers", value: peopleStats.managerCount },
        ]
      : [];

  return (
    <Container size="wide" className="py-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10">
      <WorkspaceMasthead
        eyebrow="Tamil Sangam workspace"
        title={organisation.name || "Your Sangam"}
        location={organisationLocationLabel(activeSangam)}
        description="Your Sangam's presence, registration and people across the federation."
        status={
          <RegistrationStatusBadge status={registration.status} inverse />
        }
        stats={stats}
        updatedAt={
          peopleStats.status === "loaded" ? peopleStats.updatedAt : undefined
        }
        actions={
          <>
            <Link
              href={canEdit ? "/join/sangam" : peopleHref}
              className={workspacePrimaryActionClassName}
            >
              {canEdit
                ? registration.status === "needs_changes"
                  ? "Update registration"
                  : "Continue registration"
                : "Manage people"}
            </Link>
            <Link
              href="/dashboard/account"
              className={workspaceSecondaryActionClassName}
            >
              Account settings
            </Link>
          </>
        }
      />

      <div className="mt-10">
        <WorkspaceSectionHeading
          title="Workspace overview"
          description="Your Sangam's essential administration, presented clearly without unfinished programmes crowding the page."
        />
      </div>

      <div data-motion-group className="mt-6 grid gap-5 xl:grid-cols-3">
        <WorkspacePanel
          eyebrow="Registration"
          title="Federation status"
          icon={<StatusGlyph />}
          description={presentation.description}
        >
          {registration.adminFeedback ? (
            <div className="border-heritage-gold/35 bg-heritage-gold/8 rounded-card border p-4">
              <p className="text-global-navy text-sm font-bold">
                Review feedback
              </p>
              <p className="text-charcoal mt-1 text-sm leading-6">
                {registration.adminFeedback}
              </p>
            </div>
          ) : null}
          {canEdit ? (
            <Link href="/join/sangam" className={panelActionClassName}>
              Open registration
            </Link>
          ) : null}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="People"
          title="Members and managers"
          icon={<PeopleGlyph />}
          href={peopleHref}
          linkLabel="Open people management"
          description={
            peopleStats.status === "loaded"
              ? `${peopleStats.approvedCount} approved member${peopleStats.approvedCount === 1 ? "" : "s"}, ${peopleStats.managerCount} manager${peopleStats.managerCount === 1 ? "" : "s"}.`
              : "Review affiliation requests and manage the people connected to this Tamil Sangam."
          }
        >
          {peopleStats.status === "loaded" && peopleStats.pendingCount > 0 ? (
            <div className="border-heritage-gold/45 bg-heritage-gold/10 rounded-card flex items-center gap-2.5 border p-3">
              <span
                aria-hidden="true"
                className="bg-heritage-maroon size-2 shrink-0 animate-pulse rounded-full"
              />
              <p className="text-global-navy text-sm font-bold">
                {peopleStats.pendingCount} request
                {peopleStats.pendingCount === 1 ? "" : "s"} awaiting your review
              </p>
            </div>
          ) : null}
        </WorkspacePanel>

        {organisation.officialEmail ? (
          <OrganisationEmailVerificationCard
            organisationId={organisation.id}
            officialEmail={organisation.officialEmail}
            verifiedAt={organisation.officialEmailVerifiedAt}
            verificationSentAt={organisation.officialEmailVerificationSentAt}
            canRequest={canEdit || registration.status === "submitted"}
          />
        ) : (
          <WorkspacePanel
            eyebrow="Contact"
            title="Sangam contact details"
            icon={<ContactGlyph />}
            description="Your Sangam's leadership and contact information can be updated through registration while it remains editable."
          >
            {canEdit ? (
              <Link href="/join/sangam" className={panelActionClassName}>
                Update contact details
              </Link>
            ) : null}
          </WorkspacePanel>
        )}
      </div>
    </Container>
  );
}
