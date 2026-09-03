"use client";

import {
  isTamilSangamProfile,
  type OrganisationApplication,
} from "@tamil-ulagam/shared";
import { Alert, Container, EmptyState } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { OrganisationEmailVerificationCard } from "@/components/application/organisation-email-verification";
import { RegistrationStatusBadge } from "@/components/application/registration-status-badge";
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
import { useWorkspacePeopleStats } from "@/features/workspace/use-workspace-people-stats";
import { withReturnTarget } from "@/lib/return-target";

export function OrganisationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedOrganisationId = searchParams.get("organization");

  const { myOrganisationApplications, currentUser, isHydrated, platformError } =
    usePlatform();

  const myOrganisations = useMemo(
    () =>
      myOrganisationApplications.filter(
        (application) =>
          !isTamilSangamProfile(application.registration.categoryProfile),
      ),
    [myOrganisationApplications],
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

  const peopleStats = useWorkspacePeopleStats(active?.organisation.id ?? null);

  if (!isHydrated) {
    return <WorkspaceSkeleton />;
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

  const location = [
    organisation.city,
    organisation.region,
    organisation.country,
  ]
    .filter(Boolean)
    .join(", ");
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
        eyebrow="Organisation workspace"
        title={organisation.name || "Your organisation"}
        location={location}
        description="Your organisation's presence, registration and people across the federation."
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
              href={canEdit ? "/join/organisation" : peopleHref}
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
          description="The essentials that need your attention, without unfinished programme areas competing with your work."
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
            <Link href="/join/organisation" className={panelActionClassName}>
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
              : "Review affiliation requests and manage the people connected to this organisation."
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
            title="Official email needed"
            icon={<ContactGlyph />}
            description="Add an official email through registration so Tamil Ulagam can verify your organisation's contact channel."
          >
            {canEdit ? (
              <Link href="/join/organisation" className={panelActionClassName}>
                Add official email
              </Link>
            ) : null}
          </WorkspacePanel>
        )}
      </div>
    </Container>
  );
}
