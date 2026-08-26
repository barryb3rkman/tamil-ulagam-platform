import type {
  EligibleOrganisation,
  ManagementGrant,
  Membership,
  MembershipHistoryEvent,
  MembershipRequestSummary,
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
  /** Organisation identity (the same safe EligibleOrganisation shape)
   * for every organisation the caller has ANY membership relationship
   * with — unlike listEligibleOrganisations, not limited to verified
   * organisations, so a Member Workspace can still show identity for a
   * rejected/revoked historical row. Self-scoped server-side; there is
   * no parameter through which another user's affiliated organisations
   * could be read. */
  listMyAffiliatedOrganisations(): Promise<EligibleOrganisation[]>;
  /** Organisations the given user manages (own use only in practice —
   * the underlying table's RLS only ever returns the caller's own
   * management grants for an id-filtered query like this one). Used to
   * build the manager's own organisation picker. */
  listMyManagedOrganisations(userId: string): Promise<EligibleOrganisation[]>;
  /** Every membership row for one organisation, enriched with the
   * requester's permitted display name — RLS restricts both the
   * membership rows and the profile lookups to that organisation's own
   * managers (or a reviewer); a manager of a different organisation
   * gets an empty result, not an error. */
  listOrganisationMembershipRequests(
    organisationId: string,
  ): Promise<MembershipRequestSummary[]>;
  /** An organisation manager invites a specific existing user. */
  inviteMember(
    organisationId: string,
    userId: string,
    membershipType?: MembershipType,
  ): Promise<Membership>;
  approveMembership(membershipId: string, note?: string): Promise<Membership>;
  rejectMembership(membershipId: string, note?: string): Promise<Membership>;
  revokeMembership(membershipId: string, note?: string): Promise<Membership>;
  /** The caller ends their OWN approved affiliation. There is no way to
   * target another user's membership — the RPC verifies ownership
   * itself, independent of anything this function passes. */
  leaveMembership(membershipId: string, note?: string): Promise<Membership>;
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

    async listMyAffiliatedOrganisations() {
      const { data, error } = await client.rpc(
        "list_my_affiliated_organizations",
      );
      if (error) {
        throw mapSupabaseError(
          error,
          "Your affiliated organisations could not be loaded.",
        );
      }
      return (data ?? []).map(mapEligibleOrganisationRow);
    },

    async listMyManagedOrganisations(userId) {
      const grants = await client
        .from("organization_managers")
        .select("organization_id")
        .eq("user_id", userId);
      if (grants.error) {
        throw mapSupabaseError(
          grants.error,
          "Your managed organisations could not be loaded.",
        );
      }
      const organisationIds = [
        ...new Set((grants.data ?? []).map((row) => row.organization_id)),
      ];
      if (organisationIds.length === 0) return [];

      const [organisations, details] = await Promise.all([
        client
          .from("organizations")
          .select("id, name, category, city, region, country")
          .in("id", organisationIds),
        // Phase D1: needed so a manager's People page and Sangam
        // workspace can tell a Tamil Sangam apart from a plain
        // tamil_community organisation among the accounts they manage
        // (organisationKindLabel/isTamilSangam) — one extra, narrow join,
        // same shape as list_membership_eligible_organizations' own
        // subtype projection.
        client
          .from("organization_tamil_community_details")
          .select("organization_id, subtype")
          .in("organization_id", organisationIds),
      ]);
      if (organisations.error) {
        throw mapSupabaseError(
          organisations.error,
          "Your managed organisations could not be loaded.",
        );
      }
      if (details.error) {
        throw mapSupabaseError(
          details.error,
          "Your managed organisations could not be loaded.",
        );
      }
      const subtypeByOrganisation = new Map(
        (details.data ?? []).map((row) => [row.organization_id, row.subtype]),
      );
      return (organisations.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category ?? "",
        subtype: subtypeByOrganisation.get(row.id) ?? "",
        city: row.city,
        region: row.region,
        country: row.country,
      }));
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
      const memberships = (data ?? []).map(mapMembershipRow);
      if (memberships.length === 0) return [];

      // Enriched here, in the service boundary, rather than leaving each
      // React component to query profiles independently — one extra
      // RLS-protected read, reusing the Phase A1
      // profiles_select_organization_manager_for_member policy (a
      // manager only ever receives names for members of their own
      // organisation; RLS silently omits anything else rather than
      // erroring).
      const userIds = [...new Set(memberships.map((m) => m.userId))];
      const profiles = await client
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      if (profiles.error) {
        throw mapSupabaseError(
          profiles.error,
          "Requester details could not be loaded.",
        );
      }
      const nameById = new Map(
        (profiles.data ?? []).map((row) => [row.id, row.full_name]),
      );
      return memberships.map((membership) => ({
        ...membership,
        memberFullName: nameById.get(membership.userId) ?? "",
      }));
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

    async leaveMembership(membershipId, note) {
      const { data, error } = await client.rpc(
        "leave_organization_membership",
        { target_membership_id: membershipId, decision_note: note },
      );
      if (error)
        throw mapSupabaseError(error, "The membership could not be left.");
      if (!data) {
        throw new PlatformServiceError(
          "Leaving the membership did not return a result.",
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
