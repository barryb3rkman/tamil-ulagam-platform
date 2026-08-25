"use client";

import { Alert, Container, EmptyState } from "@tamil-ulagam/ui";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MemberDirectorySkeleton } from "@/components/member/member-directory";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";
import { withReturnTarget } from "@/lib/return-target";

import { AffiliationCard } from "./affiliation-card";

type DataState = "loading" | "loaded" | "error";

const statusOrder: Record<Membership["status"], number> = {
  approved: 0,
  pending: 1,
  rejected: 2,
  revoked: 3,
};

/**
 * The first real Member Workspace (Phase C2). Deliberately not a
 * metric-card dashboard — the landing content is the affiliations list
 * itself, grouped by status, answering "what am I connected to / what's
 * pending / what changed" directly rather than through summary tiles.
 */
export function MemberWorkspace() {
  const { currentUser, isHydrated } = usePlatform();
  const membershipService = useMembershipService();

  const [dataState, setDataState] = useState<DataState>("loading");
  const [memberships, setMemberships] = useState<readonly Membership[]>([]);
  const [organisations, setOrganisations] = useState<
    readonly EligibleOrganisation[]
  >([]);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isHydrated || !currentUser || !membershipService) return;
    let cancelled = false;

    Promise.all([
      membershipService.listMyMemberships(),
      membershipService.listMyAffiliatedOrganisations(),
    ])
      .then(([myMemberships, myOrganisations]) => {
        if (cancelled) return;
        setMemberships(myMemberships);
        setOrganisations(myOrganisations);
        setError("");
        setDataState("loaded");
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Your Member Workspace could not be loaded.",
        );
        setDataState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, currentUser, membershipService, reloadKey]);

  const retry = useCallback(() => {
    setDataState("loading");
    setReloadKey((value) => value + 1);
  }, []);

  const organisationById = useMemo(
    () => new Map(organisations.map((org) => [org.id, org])),
    [organisations],
  );

  const sortedMemberships = useMemo(
    () =>
      [...memberships].sort(
        (a, b) => statusOrder[a.status] - statusOrder[b.status],
      ),
    [memberships],
  );

  const handleLeft = (updated: Membership) => {
    setMemberships((previous) =>
      previous.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  if (!isHydrated) {
    return (
      <Container className="py-16 sm:py-20">
        <MemberDirectorySkeleton />
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-global-navy text-2xl font-bold">
            Sign in to view your Member Workspace
          </h1>
          <p className="text-slate mt-2">
            Your affiliations are only visible once you&rsquo;re signed in.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={withReturnTarget("/login", "/workspace/member")}
              className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
            >
              Sign in
            </Link>
            <Link
              href={withReturnTarget("/signup", "/workspace/member")}
              className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
            >
              Create account
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  if (!membershipService) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="info" title="Member Workspace is not available here">
          Member Registration is not configured for this deployment.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <div data-motion-reveal="">
        <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
          MEMBER WORKSPACE
        </p>
        <h1 className="text-global-navy mt-2 text-3xl font-bold tracking-[-0.01em]">
          Your affiliations
        </h1>
        <p className="text-slate mt-2 max-w-xl">
          Every Organisation and Tamil Sangam you&rsquo;ve connected with, and
          anything waiting on a decision.
        </p>
        <p className="mt-4">
          <Link
            href="/dashboard/account"
            className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Account settings
          </Link>
        </p>
      </div>

      <div className="mt-8">
        {dataState === "loading" ? (
          <MemberDirectorySkeleton />
        ) : dataState === "error" ? (
          <Alert
            tone="error"
            role="alert"
            title="Your Workspace could not load"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={retry}
              className="text-error focus-visible:ring-focus rounded-button mt-3 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
            >
              Try again
            </button>
          </Alert>
        ) : sortedMemberships.length === 0 ? (
          <EmptyState
            title="No affiliations yet"
            description="Find a registered Organisation or Tamil Sangam and request to join."
            action={
              <Link
                href="/join/member"
                className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white focus-visible:outline-none"
              >
                Find an organisation
              </Link>
            }
          />
        ) : (
          <ul data-motion-group className="grid grid-cols-1 gap-4">
            {sortedMemberships.map((membership) => {
              const organisation = organisationById.get(
                membership.organisationId,
              );
              if (!organisation) return null;
              return (
                <li key={membership.id}>
                  <AffiliationCard
                    organisation={organisation}
                    membership={membership}
                    onLeft={handleLeft}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
