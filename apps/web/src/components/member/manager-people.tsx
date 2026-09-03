"use client";

import { Alert, Container, EmptyState, Skeleton } from "@tamil-ulagam/ui";
import type {
  EligibleOrganisation,
  MembershipRequestSummary,
} from "@tamil-ulagam/shared";
import { isTamilSangam } from "@tamil-ulagam/shared";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useRealtimeRefresh } from "@/features/realtime/use-realtime-refresh";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";
import { withReturnTarget } from "@/lib/return-target";

import { MembershipRequestRow } from "./membership-request-row";
import { OrganisationManagers } from "./organisation-managers";
import { ListSkeleton } from "@/components/workspace/workspace-skeleton";
import {
  organisationKindLabel,
  organisationLocationLabel,
} from "./organisation-presentation";

type DataState = "loading" | "loaded" | "error";
type Tab = "members" | "managers";

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
  const [requestsReloadKey, setRequestsReloadKey] = useState(0);
  const [requests, setRequests] = useState<readonly MembershipRequestSummary[]>(
    [],
  );
  const [requestsError, setRequestsError] = useState("");

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

    return () => {
      cancelled = true;
    };
  }, [membershipService, activeOrganisation, requestsReloadKey]);

  useRealtimeRefresh({
    table: "organization_memberships",
    enabled: Boolean(activeOrganisation),
    filter: activeOrganisation
      ? `organization_id=eq.${activeOrganisation.id}`
      : undefined,
    onChange: () => setRequestsReloadKey((value) => value + 1),
  });

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
    return <ListSkeleton />;
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
    return <ListSkeleton />;
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

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const decidedRequests = requests.filter((r) => r.status !== "pending");
  const pendingCount = pendingRequests.length;

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
        PEOPLE
      </p>
      <h1 className="text-global-navy mt-2 text-3xl font-bold tracking-[-0.01em]">
        {activeOrganisation.name}
      </h1>
      <p className="text-slate mt-2">
        {organisationKindLabel(activeOrganisation)}
        <span aria-hidden="true"> · </span>
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
          Affiliations{pendingCount > 0 ? ` (${pendingCount} pending)` : ""}
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
              title="No affiliation activity yet"
              description="Affiliation claims for this organisation will appear here."
            />
          ) : (
            <div className="grid gap-6">
              {pendingRequests.length > 0 ? (
                <div className="surface-card px-5">
                  <h2 className="text-global-navy pt-5 text-base font-bold">
                    Pending affiliation confirmations
                  </h2>
                  {pendingRequests.map((request) => (
                    <MembershipRequestRow
                      key={request.id}
                      request={request}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              ) : null}
              {decidedRequests.length > 0 ? (
                <div className="surface-card px-5">
                  <h2 className="text-global-navy pt-5 text-base font-bold">
                    Other affiliations
                  </h2>
                  {decidedRequests.map((request) => (
                    <MembershipRequestRow
                      key={request.id}
                      request={request}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )
        ) : (
          <OrganisationManagers
            organisationId={activeOrganisation.id}
            organisationName={activeOrganisation.name}
            isSangam={isTamilSangam(activeOrganisation)}
            currentUserId={currentUser.id}
          />
        )}
      </div>
    </Container>
  );
}
