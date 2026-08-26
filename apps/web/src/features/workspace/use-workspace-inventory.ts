"use client";

import type { EligibleOrganisation } from "@tamil-ulagam/shared";
import { useEffect, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";

export type WorkspaceInventoryState = "loading" | "loaded" | "error";

export interface WorkspaceInventory {
  readonly state: WorkspaceInventoryState;
  readonly error: string;
  /** Every organisation (Sangam or otherwise) the caller manages — see
   * `buildWorkspaceOptions` for the Organisation/Sangam split. */
  readonly managedOrganisations: readonly EligibleOrganisation[];
  readonly isAuthenticated: boolean;
  readonly canReviewApplications: boolean;
  readonly isHydrated: boolean;
  /** Whether `listMyManagedOrganisations` is actually backed by a real
   * service (Supabase). False under the mock backend — callers that need
   * to distinguish "genuinely zero managed organisations" from "this
   * signal isn't available here" (e.g. `/dashboard`'s guidance, which
   * still needs to work under the mock backend) should check this before
   * trusting an empty `managedOrganisations` list. */
  readonly serviceAvailable: boolean;
  readonly reload: () => void;
}

interface FetchResult {
  readonly status: WorkspaceInventoryState;
  readonly organisations: readonly EligibleOrganisation[];
  readonly error: string;
}

const initialFetchResult: FetchResult = {
  status: "loading",
  organisations: [],
  error: "",
};

/**
 * The single fetch behind the workspace switcher and the `/dashboard`
 * compatibility guidance (brief section 34: "do not refetch the same
 * organisation/Sangam list independently in shell, workspace page, and
 * People page"). `listMyManagedOrganisations` already exists (extended
 * in Phase D1 with Sangam `subtype`) and is exactly what
 * `SangamWorkspace` and `ManagerPeople` already call themselves for
 * their own, narrower purposes (resolving *which* Sangam/organisation a
 * query param points at, not building a cross-workspace switcher) — this
 * hook is a new call site, not a replacement for those. Documented,
 * accepted duplication: when the new `WorkspaceShell` and, say,
 * `SangamWorkspace` are both mounted on `/workspace/sangam`, the RPC
 * fires twice (once here, once in `SangamWorkspace`). This is bounded
 * (one extra request per page view, not per-item) and deliberately not
 * eliminated this phase — doing so would mean threading a shared context
 * through already-shipped, already-tested D1/C2 components under this
 * phase's "do not redesign registration/lifecycle flows" constraint.
 */
export function useWorkspaceInventory(): WorkspaceInventory {
  const { currentUser, isHydrated, canReviewApplications } = usePlatform();
  const membershipService = useMembershipService();
  const needsFetch =
    isHydrated && Boolean(currentUser) && Boolean(membershipService);

  const [fetchResult, setFetchResult] =
    useState<FetchResult>(initialFetchResult);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!needsFetch || !currentUser || !membershipService) return;
    let cancelled = false;
    membershipService
      .listMyManagedOrganisations(currentUser.id)
      .then((organisations) => {
        if (cancelled) return;
        setFetchResult({ status: "loaded", organisations, error: "" });
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setFetchResult({
          status: "error",
          organisations: [],
          error:
            loadError instanceof Error
              ? loadError.message
              : "Your workspaces could not be loaded.",
        });
      });
    return () => {
      cancelled = true;
    };
    // reloadKey deliberately participates only to retrigger the fetch —
    // its value itself is never read.
  }, [needsFetch, currentUser, membershipService, reloadKey]);

  return {
    // Not hydrated yet, or hydrated with nothing to fetch (logged out /
    // service unavailable): both resolve without an effect at all — the
    // second case is "trivially loaded, empty" rather than a pending
    // fetch, computed at render time rather than via a setState-in-effect
    // that only ever mirrors already-known reactive values.
    state: !isHydrated ? "loading" : needsFetch ? fetchResult.status : "loaded",
    error: needsFetch ? fetchResult.error : "",
    managedOrganisations: needsFetch ? fetchResult.organisations : [],
    isAuthenticated: Boolean(currentUser),
    canReviewApplications,
    isHydrated,
    serviceAvailable: Boolean(membershipService),
    reload: () => {
      setFetchResult(initialFetchResult);
      setReloadKey((value) => value + 1);
    },
  };
}
