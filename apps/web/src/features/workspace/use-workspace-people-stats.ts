"use client";

import { useEffect, useState } from "react";

import { useMembershipService } from "@/features/membership/use-membership-service";
import { useRealtimeRefresh } from "@/features/realtime/use-realtime-refresh";

export interface WorkspacePeopleStats {
  readonly approvedCount: number;
  readonly pendingCount: number;
  readonly managerCount: number;
}

export type WorkspacePeopleStatsState =
  | { readonly status: "unavailable" }
  | { readonly status: "loading" }
  | { readonly status: "error" }
  | ({
      readonly status: "loaded";
      readonly updatedAt: number;
    } & WorkspacePeopleStats);

type FetchState =
  | { readonly status: "loading" }
  | { readonly status: "error" }
  | ({
      readonly status: "loaded";
      readonly updatedAt: number;
    } & WorkspacePeopleStats);

export function useWorkspacePeopleStats(
  organisationId: string | null,
): WorkspacePeopleStatsState {
  const membershipService = useMembershipService();
  const [fetchState, setFetchState] = useState<FetchState>({
    status: "loading",
  });
  const [trackedOrganisationId, setTrackedOrganisationId] =
    useState(organisationId);
  const [reloadKey, setReloadKey] = useState(0);
  if (organisationId !== trackedOrganisationId) {
    setTrackedOrganisationId(organisationId);
    setFetchState({ status: "loading" });
  }

  useEffect(() => {
    if (!membershipService || !organisationId) return;
    let cancelled = false;
    Promise.all([
      membershipService.listOrganisationMembershipRequests(organisationId),
      membershipService.listOrganisationManagers(organisationId),
    ])
      .then(([requests, managers]) => {
        if (cancelled) return;
        setFetchState({
          status: "loaded",
          updatedAt: Date.now(),
          approvedCount: requests.filter((r) => r.status === "approved").length,
          pendingCount: requests.filter((r) => r.status === "pending").length,
          managerCount: managers.length,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setFetchState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [membershipService, organisationId, reloadKey]);

  const organisationFilter = organisationId
    ? `organization_id=eq.${organisationId}`
    : undefined;
  const bumpReloadKey = () => setReloadKey((value) => value + 1);
  useRealtimeRefresh({
    table: "organization_memberships",
    enabled: Boolean(organisationId),
    filter: organisationFilter,
    onChange: bumpReloadKey,
  });
  useRealtimeRefresh({
    table: "organization_managers",
    enabled: Boolean(organisationId),
    filter: organisationFilter,
    onChange: bumpReloadKey,
  });

  if (!membershipService || !organisationId) return { status: "unavailable" };
  return fetchState;
}
