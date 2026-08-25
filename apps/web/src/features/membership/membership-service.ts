import type {
  EligibleOrganisation,
  ManagementGrant,
  Membership,
  MembershipHistoryEvent,
  MembershipType,
} from "@tamil-ulagam/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { mapSupabaseError, PlatformServiceError } from "@/lib/supabase/errors";
import {
  mapEligibleOrganisationRow,
  mapManagementGrantRow,
  mapMembershipHistoryRow,
  mapMembershipRow,
} from "@/lib/supabase/membership-row-mappers";

/**
 * Typed MEMBERSHIP vs MANAGEMENT service boundary (Product V3, Phase A1).
 *
 * Prepared ahead of the Member Registration UI per the phase brief: no
 * screen calls this yet, and it is not wired into PlatformProvider. Every
 * write is a narrow RPC (never a raw `.update()`), matching the
 * migration's design — privileged fields (status, decided_at/by,
 * invited_by) are never client-supplied. UI code that needs this later
 * should call these functions rather than reaching into Supabase
 * directly, keeping the UI -> service -> Supabase boundary the rest of
 * the codebase already follows.
 */

function toDatabaseMembershipType(
  membershipType: MembershipType | undefined,
): Database["public"]["Enums"]["organization_membership_type"] | undefined {
  return membershipType ? membershipType : undefined;
}

export interface MembershipService {
  /** Verified organisations/Sangams a member could request to join —
   * a safe, narrow projection (see EligibleOrganisation). */
  listEligibleOrganisations(): Promise<EligibleOrganisation[]>;
  /** Create (or idempotently re-read) the caller's own pending/approved
   * request for an eligible organisation. Always acts as the caller —
   * there is no way to pass another user's id. */
  requestMembership(
    organisationId: string,
    membershipType?: MembershipType,
  ): Promise<Membership>;
  /** The caller's own membership rows, across every organisation. */
  listMyMemberships(): Promise<Membership[]>;
  /** Every membership row for one organisation — RLS restricts this to
   * that organisation's own managers (or a reviewer). */
  listOrganisationMembershipRequests(
    organisationId: string,
  ): Promise<Membership[]>;
  /** An organisation manager invites a specific existing user. */
  inviteMember(
    organisationId: string,
    userId: string,
    membershipType?: MembershipType,
  ): Promise<Membership>;
  approveMembership(membershipId: string, note?: string): Promise<Membership>;
  rejectMembership(membershipId: string, note?: string): Promise<Membership>;
  revokeMembership(membershipId: string, note?: string): Promise<Membership>;
  /** Audit history for one membership row (own row, or the owning
   * organisation's managers/reviewers). */
  listMembershipHistory(
    membershipId: string,
  ): Promise<MembershipHistoryEvent[]>;
  /** The management roster for one organisation. */
  listOrganisationManagers(organisationId: string): Promise<ManagementGrant[]>;
}

export function createMembershipService(
  client: SupabaseClient<Database>,
): MembershipService {
  return {
    async listEligibleOrganisations() {
      const { data, error } = await client.rpc(
        "list_membership_eligible_organizations",
      );
      if (error)
        throw mapSupabaseError(error, "Organisations could not be loaded.");
      return (data ?? []).map(mapEligibleOrganisationRow);
    },

    async requestMembership(organisationId, membershipType) {
      const { data, error } = await client.rpc(
        "request_organization_membership",
        {
          target_organization_id: organisationId,
          requested_membership_type: toDatabaseMembershipType(membershipType),
        },
      );
      if (error) {
        throw mapSupabaseError(
          error,
          "The membership request could not be sent.",
        );
      }
      if (!data) {
        throw new PlatformServiceError(
          "The membership request did not return a result.",
          "unknown",
        );
      }
      return mapMembershipRow(data);
    },

    async listMyMemberships() {
      const { data, error } = await client
        .from("organization_memberships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error)
        throw mapSupabaseError(error, "Your memberships could not be loaded.");
      return (data ?? []).map(mapMembershipRow);
    },

    async listOrganisationMembershipRequests(organisationId) {
      const { data, error } = await client
        .from("organization_memberships")
        .select("*")
        .eq("organization_id", organisationId)
        .order("created_at", { ascending: false });
      if (error) {
        throw mapSupabaseError(
          error,
          "This organisation's membership requests could not be loaded.",
        );
      }
      return (data ?? []).map(mapMembershipRow);
    },

    async inviteMember(organisationId, userId, membershipType) {
      const { data, error } = await client.rpc("invite_organization_member", {
        target_organization_id: organisationId,
        target_user_id: userId,
        invited_membership_type: toDatabaseMembershipType(membershipType),
      });
      if (error)
        throw mapSupabaseError(error, "The invitation could not be sent.");
      if (!data) {
        throw new PlatformServiceError(
          "The invitation did not return a result.",
          "unknown",
        );
      }
      return mapMembershipRow(data);
    },

    async approveMembership(membershipId, note) {
      const { data, error } = await client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: membershipId,
          target_status: "approved",
          decision_note: note,
        },
      );
      if (error)
        throw mapSupabaseError(error, "The request could not be approved.");
      if (!data) {
        throw new PlatformServiceError(
          "The approval did not return a result.",
          "unknown",
        );
      }
      return mapMembershipRow(data);
    },

    async rejectMembership(membershipId, note) {
      const { data, error } = await client.rpc(
        "decide_organization_membership",
        {
          target_membership_id: membershipId,
          target_status: "rejected",
          decision_note: note,
        },
      );
      if (error)
        throw mapSupabaseError(error, "The request could not be rejected.");
      if (!data) {
        throw new PlatformServiceError(
          "The rejection did not return a result.",
          "unknown",
        );
      }
      return mapMembershipRow(data);
    },

    async revokeMembership(membershipId, note) {
      const { data, error } = await client.rpc(
        "revoke_organization_membership",
        { target_membership_id: membershipId, decision_note: note },
      );
      if (error)
        throw mapSupabaseError(error, "The membership could not be revoked.");
      if (!data) {
        throw new PlatformServiceError(
          "The revocation did not return a result.",
          "unknown",
        );
      }
      return mapMembershipRow(data);
    },

    async listMembershipHistory(membershipId) {
      const { data, error } = await client
        .from("organization_membership_history")
        .select("*")
        .eq("membership_id", membershipId)
        .order("created_at", { ascending: false });
      if (error) {
        throw mapSupabaseError(
          error,
          "This membership's history could not be loaded.",
        );
      }
      return (data ?? []).map(mapMembershipHistoryRow);
    },

    async listOrganisationManagers(organisationId) {
      const { data, error } = await client
        .from("organization_managers")
        .select("*")
        .eq("organization_id", organisationId);
      if (error) {
        throw mapSupabaseError(
          error,
          "This organisation's managers could not be loaded.",
        );
      }
      return (data ?? []).map(mapManagementGrantRow);
    },
  };
}
