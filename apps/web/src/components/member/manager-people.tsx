"use client";

import { Alert, Container, EmptyState, Skeleton } from "@tamil-ulagam/ui";
import type {
  EligibleOrganisation,
  ManagementGrant,
  MembershipRequestSummary,
} from "@tamil-ulagam/shared";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";
import { withReturnTarget } from "@/lib/return-target";

import { MembershipRequestRow } from "./membership-request-row";
import { organisationLocationLabel } from "./organisation-presentation";

type DataState = "loading" | "loaded" | "error";
type Tab = "members" | "managers";

const managerRoleLabel: Record<ManagementGrant["role"], string> = {
  owner: "Owner",
  admin: "Admin",
  representative: "Representative",
};

/**
 * The smallest coherent manager-facing People surface for Phase C2 —
 * not the later, complete Organisation Workspace redesign. Query-param
 * organisation selection (`?organization=<uuid>`) rather than a dynamic
 * route segment, matching this repository's proven static-export-safe
 * pattern (see e.g. dashboard-registration.tsx's `?organisation=`
 * usage) rather than introducing SSR.
 */
export function ManagerPeople() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedOrganisationId = searchParams.get("organization");

  const { currentUser, isHydrated } = usePlatform();
  const membershipService = useMembershipService();

  const [tab, setTab] = useState<Tab>("members");
  const [managedState, setManagedState] = useState<DataState>("loading");
  const [managedOrganisations, setManagedOrganisations] = useState<
    readonly EligibleOrganisation[]
  >([]);
  const [managedError, setManagedError] = useState("");

  const [requestsState, setRequestsState] = useState<DataState>("loading");
  const [requests, setRequests] = useState<readonly MembershipRequestSummary[]>(
    [],
  );
  const [requestsError, setRequestsError] = useState("");

  const [managersState, setManagersState] = useState<DataState>("loading");
  const [managers, setManagers] = useState<readonly ManagementGrant[]>([]);

  // Load the organisations this user manages, to power the picker (no
  // ?organization= yet) and to resolve the current organisation's name.
  useEffect(() => {
    if (!isHydrated || !currentUser || !membershipService) return;
    let cancelled = false;
    membershipService
      .listMyManagedOrganisations(currentUser.id)
      .then((organisations) => {
        if (cancelled) return;
        setManagedOrganisations(organisations);
        setManagedState("loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setManagedError(
          error instanceof Error
            ? error.message
            : "Your managed organisations could not be loaded.",
        );
        setManagedState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [isHydrated, currentUser, membershipService]);

  const activeOrganisation = useMemo(
    () =>
      managedOrganisations.find((org) => org.id === requestedOrganisationId),
    [managedOrganisations, requestedOrganisationId],
  );

  // Convenience: with exactly one managed organisation and no explicit
  // selection yet, go straight there — an unambiguous shortcut, not a
  // cross-domain redirect.
  useEffect(() => {
    if (
      managedState === "loaded" &&
      !requestedOrganisationId &&
      managedOrganisations.length === 1
    ) {
      router.replace(
        `/workspace/organisation/people?organization=${managedOrganisations[0]?.id}`,
      );
    }
  }, [managedState, requestedOrganisationId, managedOrganisations, router]);

  useEffect(() => {
    if (!membershipService || !activeOrganisation) return;
    let cancelled = false;

    membershipService
      .listOrganisationMembershipRequests(activeOrganisation.id)
      .then((data) => {
        if (cancelled) return;
        setRequests(data);
        setRequestsState("loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setRequestsError(
          error instanceof Error
            ? error.message
            : "Membership requests could not be loaded.",
        );
        setRequestsState("error");
      });

    membershipService
      .listOrganisationManagers(activeOrganisation.id)
      .then((data) => {
        if (cancelled) return;
        setManagers(data);
        setManagersState("loaded");
      })
      .catch(() => {
        if (cancelled) return;
        setManagersState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [membershipService, activeOrganisation]);

  const replaceRequest = (updated: MembershipRequestSummary) => {
    setRequests((previous) =>
      previous.map((item) =>
        item.id === updated.id ? { ...item, ...updated } : item,
      ),
    );
  };

  const handleApprove = async (request: MembershipRequestSummary) => {
    if (!membershipService) return;
    const updated = await membershipService.approveMembership(request.id);
    replaceRequest({ ...request, ...updated });
  };

  const handleReject = async (request: MembershipRequestSummary) => {
    if (!membershipService) return;
    const updated = await membershipService.rejectMembership(request.id);
    replaceRequest({ ...request, ...updated });
  };

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
            Sign in to manage your organisation&rsquo;s People
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={withReturnTarget(
                "/login",
                requestedOrganisationId
                  ? `/workspace/organisation/people?organization=${requestedOrganisationId}`
                  : "/workspace/organisation/people",
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

  if (!membershipService) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="info" title="People is not available here">
          Member Registration is not configured for this deployment.
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

  if (managedOrganisations.length === 0) {
    return (
      <Container className="py-16 sm:py-20">
        <EmptyState
          title="You don't manage an organisation"
          description="People is only available to an organisation or Tamil Sangam's own managers."
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
          {managedOrganisations.map((organisation) => (
            <li key={organisation.id}>
              <Link
                href={`/workspace/organisation/people?organization=${organisation.id}`}
                className="surface-card motion-card border-global-navy/10 block p-5"
              >
                <p className="text-global-navy font-bold">
                  {organisation.name}
                </p>
                <p className="text-slate text-sm">
                  {organisationLocationLabel(organisation)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    );
  }

  if (!activeOrganisation) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="warning" title="You don't manage this organisation">
          Choose one of the organisations you manage instead.
        </Alert>
        <p className="mt-4">
          <Link
            href="/workspace/organisation/people"
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            View your organisations
          </Link>
        </p>
      </Container>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
        PEOPLE
      </p>
      <h1 className="text-global-navy mt-2 text-3xl font-bold tracking-[-0.01em]">
        {activeOrganisation.name}
      </h1>
      <p className="text-slate mt-2">
        {organisationLocationLabel(activeOrganisation)}
      </p>

      <div
        role="tablist"
        aria-label="People sections"
        className="border-global-navy/10 mt-8 flex gap-6 border-b"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "members"}
          onClick={() => setTab("members")}
          className={`focus-visible:ring-focus -mb-px border-b-2 px-1 py-3 text-sm font-semibold focus-visible:outline-none ${
            tab === "members"
              ? "border-heritage-maroon text-heritage-maroon"
              : "text-slate border-transparent"
          }`}
        >
          Members{pendingCount > 0 ? ` (${pendingCount} pending)` : ""}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "managers"}
          onClick={() => setTab("managers")}
          className={`focus-visible:ring-focus -mb-px border-b-2 px-1 py-3 text-sm font-semibold focus-visible:outline-none ${
            tab === "managers"
              ? "border-heritage-maroon text-heritage-maroon"
              : "text-slate border-transparent"
          }`}
        >
          Managers
        </button>
      </div>

      <div className="mt-6">
        {tab === "members" ? (
          requestsState === "loading" ? (
            <Skeleton className="h-48 w-full" />
          ) : requestsState === "error" ? (
            <Alert tone="error" role="alert">
              {requestsError}
            </Alert>
          ) : requests.length === 0 ? (
            <EmptyState
              title="No membership activity yet"
              description="Requests to join this organisation will appear here."
            />
          ) : (
            <div className="surface-card px-5">
              {requests.map((request) => (
                <MembershipRequestRow
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )
        ) : managersState === "loading" ? (
          <Skeleton className="h-32 w-full" />
        ) : managersState === "error" ? (
          <Alert tone="error" role="alert">
            Managers could not be loaded.
          </Alert>
        ) : (
          <div className="surface-card px-5">
            <p className="text-slate px-0 py-3 text-sm">
              Read-only for now — adding or removing managers isn&rsquo;t
              available yet.
            </p>
            {managers.map((manager) => (
              <div
                key={manager.id}
                className="border-global-navy/10 flex items-center justify-between border-t py-3"
              >
                <span className="text-charcoal text-sm">
                  {manager.userId === currentUser.id
                    ? "You"
                    : "Another manager"}
                </span>
                <span className="text-slate text-sm font-semibold">
                  {managerRoleLabel[manager.role]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
