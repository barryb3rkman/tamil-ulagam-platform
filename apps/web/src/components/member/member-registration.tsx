"use client";

import { Alert, Container } from "@tamil-ulagam/ui";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import { useCallback, useEffect, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";

import { MemberConfirmRequest } from "./member-confirm-request";
import { MemberDirectory, MemberDirectorySkeleton } from "./member-directory";
import { MemberLoggedOut } from "./member-logged-out";
import { MemberRequestSuccess } from "./member-request-success";

type DataState = "loading" | "loaded" | "error";

/**
 * Auth-aware entry point for /join/member. Three-state discipline
 * throughout, the same lesson the earlier session-restoration bug
 * taught: never render "no membership"/"logged out" content before
 * `isHydrated` resolves, and never flash the wrong thing before
 * correcting it.
 *
 *   isHydrated false          -> loading
 *   isHydrated true, no user  -> MemberLoggedOut
 *   isHydrated true, user,
 *     directory loading       -> loading
 *     directory error         -> retry
 *     directory loaded        -> MemberDirectory / confirm / success
 *       (pending/approved/rejected/revoked are per-organisation card
 *       states inside the directory, not separate top-level screens —
 *       a person can hold several affiliations at once, see item 17 of
 *       the Phase C2 report).
 */
export function MemberRegistration() {
  const { isHydrated, currentUser } = usePlatform();
  const membershipService = useMembershipService();

  const [dataState, setDataState] = useState<DataState>("loading");
  const [organisations, setOrganisations] = useState<
    readonly EligibleOrganisation[]
  >([]);
  const [myMemberships, setMyMemberships] = useState<readonly Membership[]>([]);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<EligibleOrganisation | null>(null);
  const [justRequested, setJustRequested] =
    useState<EligibleOrganisation | null>(null);

  useEffect(() => {
    if (!isHydrated || !currentUser || !membershipService) return;
    let cancelled = false;

    Promise.all([
      membershipService.listEligibleOrganisations(),
      membershipService.listMyMemberships(),
    ])
      .then(([eligibleOrganisations, memberships]) => {
        if (cancelled) return;
        setOrganisations(eligibleOrganisations);
        setMyMemberships(memberships);
        setLoadError("");
        setDataState("loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "The directory could not be loaded. Please try again.",
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

  const handleConfirm = useCallback(async () => {
    if (!selected || !membershipService) return;
    const membership = await membershipService.requestMembership(selected.id);
    setMyMemberships((previous) => [
      membership,
      ...previous.filter((item) => item.id !== membership.id),
    ]);
    setJustRequested(selected);
    setSelected(null);
  }, [selected, membershipService]);

  if (!isHydrated) {
    return (
      <Container className="py-16 sm:py-20">
        <MemberDirectorySkeleton />
      </Container>
    );
  }

  if (!currentUser) {
    return <MemberLoggedOut />;
  }

  if (!membershipService) {
    return (
      <Container className="py-16 sm:py-20">
        <Alert tone="info" title="Member Registration is not available here">
          Member Registration is not configured for this deployment. Set
          NEXT_PUBLIC_ENROLLMENT_BACKEND=supabase with both public Supabase
          values and rebuild the site.
        </Alert>
      </Container>
    );
  }

  const myMembershipsByOrganisation = new Map<string, Membership>();
  for (const membership of myMemberships) {
    if (!myMembershipsByOrganisation.has(membership.organisationId)) {
      myMembershipsByOrganisation.set(membership.organisationId, membership);
    }
  }

  return (
    <Container className="py-16 sm:py-20 lg:py-24">
      {dataState === "loading" ? (
        <MemberDirectorySkeleton />
      ) : dataState === "error" ? (
        <Alert tone="error" role="alert" title="The directory could not load">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={retry}
            className="text-error focus-visible:ring-focus rounded-button mt-3 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Try again
          </button>
        </Alert>
      ) : justRequested ? (
        <MemberRequestSuccess
          organisation={justRequested}
          onBrowseAgain={() => setJustRequested(null)}
        />
      ) : selected ? (
        <MemberConfirmRequest
          organisation={selected}
          onBack={() => setSelected(null)}
          onConfirm={handleConfirm}
        />
      ) : (
        <MemberDirectory
          organisations={organisations}
          myMembershipsByOrganisation={myMembershipsByOrganisation}
          onSelect={setSelected}
        />
      )}
    </Container>
  );
}
