"use client";

import { Alert, Container } from "@tamil-ulagam/ui";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MemberDirectorySkeleton } from "@/components/member/member-directory";
import { LinkGlyph } from "@/components/workspace/panel-glyphs";
import {
  WorkspaceMasthead,
  workspacePrimaryActionClassName,
  workspaceSecondaryActionClassName,
  WorkspaceSectionHeading,
} from "@/components/workspace/workspace-overview-primitives";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useRealtimeRefresh } from "@/features/realtime/use-realtime-refresh";
import { useMembershipService } from "@/features/membership/use-membership-service";
import { withReturnTarget } from "@/lib/return-target";

import { AffiliationCard } from "./affiliation-card";
import { ManagementInvitationsAttention } from "./management-invitations-attention";

type DataState = "loading" | "loaded" | "error";

const statusOrder: Record<Membership["status"], number> = {
  approved: 0,
  pending: 1,
  rejected: 2,
  revoked: 3,
};

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

  useRealtimeRefresh({
    table: "organization_memberships",
    enabled: Boolean(currentUser && membershipService),
    onChange: () => setReloadKey((value) => value + 1),
  });

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

  const activeCount = memberships.filter(
    (membership) => membership.status === "approved",
  ).length;
  const pendingCount = memberships.filter(
    (membership) => membership.status === "pending",
  ).length;

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
    <Container size="wide" className="py-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10">
      <WorkspaceMasthead
        eyebrow="Member workspace"
        title="Your affiliations"
        showMonogram={false}
        description="The Tamil Sangams and organisations connected to your account, including anything awaiting confirmation."
        stats={
          dataState === "loaded" && memberships.length > 0
            ? [
                { label: "Active", value: activeCount },
                {
                  label: "Awaiting confirmation",
                  value: pendingCount,
                  tone: pendingCount > 0 ? "attention" : "default",
                },
              ]
            : []
        }
        actions={
          <>
            <Link
              href="/join/member"
              className={workspacePrimaryActionClassName}
            >
              Connect a membership
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

      <div className="mt-6">
        <ManagementInvitationsAttention />
      </div>

      <div className="mt-10">
        <WorkspaceSectionHeading
          title="Connections"
          description="Your real membership connections and their current confirmation status."
        />
      </div>

      <div className="mt-6">
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
          <div className="gradient-aurora-light border-global-navy/[0.09] rounded-large relative isolate grid justify-items-center gap-3 overflow-hidden border px-6 py-14 text-center">
            <span
              aria-hidden="true"
              data-motion-ambient
              className="bg-heritage-gold/20 motion-float pointer-events-none absolute -top-16 right-1/4 size-48 rounded-full blur-3xl"
            />
            <span
              aria-hidden="true"
              className="border-heritage-gold/40 text-heritage-maroon relative grid size-14 shrink-0 place-items-center rounded-2xl border bg-white shadow-[0_0.75rem_2rem_rgba(214,168,75,0.22)]"
            >
              <LinkGlyph />
            </span>
            <p className="text-section-title text-gradient-ink relative mt-1">
              No affiliations yet
            </p>
            <p className="text-slate relative max-w-sm text-sm leading-6">
              Connect your account to a registered Tamil Sangam or Organisation
              you already belong to, and it will appear here once confirmed.
            </p>
            <Link
              href="/join/member"
              className={`${workspacePrimaryActionClassName} relative mt-2`}
            >
              Connect your membership
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
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
