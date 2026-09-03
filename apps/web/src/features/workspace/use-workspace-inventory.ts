"use client";

import type { EligibleOrganisation } from "@tamil-ulagam/shared";
import { useEffect, useState } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";

export type WorkspaceInventoryState = "loading" | "loaded" | "error";

export interface WorkspaceInventory {
  readonly state: WorkspaceInventoryState;
  readonly error: string;
  readonly managedOrganisations: readonly EligibleOrganisation[];
  readonly isAuthenticated: boolean;
  readonly canReviewApplications: boolean;
  readonly isHydrated: boolean;
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
  }, [needsFetch, currentUser, membershipService, reloadKey]);

  return {
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
