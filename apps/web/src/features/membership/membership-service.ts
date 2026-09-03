import type {
  EligibleOrganisation,
  ManagementGrant,
  MemberProfile,
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

function toDatabaseMembershipType(
  membershipType: MembershipType | undefined,
): Database["public"]["Enums"]["organization_membership_type"] | undefined {
  return membershipType ? membershipType : undefined;
}

function notifyAffiliationOutcome(
  client: SupabaseClient<Database>,
  membership: Membership,
): void {
  void client.functions
    .invoke("send-affiliation-outcome", {
      body: {
        membershipId: membership.id,
        organizationId: membership.organisationId,
      },
    })
    .catch(() => {});
}

export interface AffiliationConnectionInput {
  readonly connectionType?: string;
  readonly connectionContext?: string;
  readonly connectionContextExtra?: string;
}

export interface MembershipService {
  getMyProfile(): Promise<MemberProfile>;
  updateMyProfile(profile: MemberProfile): Promise<MemberProfile>;
  listEligibleOrganisations(): Promise<EligibleOrganisation[]>;
  requestMembership(
    organisationId: string,
    membershipType?: MembershipType,
    connection?: AffiliationConnectionInput,
  ): Promise<Membership>;
  listMyMemberships(): Promise<Membership[]>;
  listMyAffiliatedOrganisations(): Promise<EligibleOrganisation[]>;
  listMyManagedOrganisations(userId: string): Promise<EligibleOrganisation[]>;
  listOrganisationMembershipRequests(
    organisationId: string,
  ): Promise<MembershipRequestSummary[]>;
  inviteMember(
    organisationId: string,
    userId: string,
    membershipType?: MembershipType,
  ): Promise<Membership>;
  approveMembership(membershipId: string, note?: string): Promise<Membership>;
  rejectMembership(membershipId: string, note?: string): Promise<Membership>;
  revokeMembership(membershipId: string, note?: string): Promise<Membership>;
  leaveMembership(membershipId: string, note?: string): Promise<Membership>;
  listMembershipHistory(
    membershipId: string,
  ): Promise<MembershipHistoryEvent[]>;
  listOrganisationManagers(organisationId: string): Promise<ManagementGrant[]>;
}

export function createMembershipService(
  client: SupabaseClient<Database>,
): MembershipService {
  return {
    async getMyProfile() {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        throw new PlatformServiceError(
          "Authentication is required.",
          "authentication",
        );
      }
      const { data, error } = await client
        .from("profiles")
        .select("full_name, phone, country, region, city")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (error)
        throw mapSupabaseError(error, "Your profile could not be loaded.");
      return {
        fullName: data?.full_name ?? "",
        phone: data?.phone ?? "",
        country: data?.country ?? "",
        region: data?.region ?? "",
        city: data?.city ?? "",
      };
    },

    async updateMyProfile(profile) {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        throw new PlatformServiceError(
          "Authentication is required.",
          "authentication",
        );
      }
      const { data, error } = await client
        .from("profiles")
        .update({
          full_name: profile.fullName.trim(),
          phone: profile.phone.trim(),
          country: profile.country.trim(),
          region: profile.region.trim(),
          city: profile.city.trim(),
        })
        .eq("id", userData.user.id)
        .select("full_name, phone, country, region, city")
        .single();
      if (error)
        throw mapSupabaseError(error, "Your profile could not be saved.");
      return {
        fullName: data.full_name,
        phone: data.phone,
        country: data.country,
        region: data.region,
        city: data.city,
      };
    },

    async listEligibleOrganisations() {
      const { data, error } = await client.rpc(
        "list_membership_eligible_organizations",
      );
      if (error)
        throw mapSupabaseError(error, "Organisations could not be loaded.");
      return (data ?? []).map(mapEligibleOrganisationRow);
    },

    async requestMembership(organisationId, membershipType, connection) {
      const { data, error } = await client.rpc(
        "request_organization_membership",
        {
          target_organization_id: organisationId,
          requested_membership_type: toDatabaseMembershipType(membershipType),
          applicant_connection_type: connection?.connectionType || undefined,
          applicant_connection_context:
            connection?.connectionContext || undefined,
          applicant_connection_context_extra:
            connection?.connectionContextExtra || undefined,
        },
      );
      if (error) {
        throw mapSupabaseError(
          error,
          "The affiliation could not be submitted.",
        );
      }
      if (!data) {
        throw new PlatformServiceError(
          "The affiliation did not return a result.",
          "unknown",
        );
      }
      return mapMembershipRow(data);
    },

    async listMyMemberships() {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        throw new PlatformServiceError(
          "Authentication is required.",
          "authentication",
        );
      }
      const { data, error } = await client
        .from("organization_memberships")
        .select("*")
        .eq("user_id", userData.user.id)
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

      const userIds = [...new Set(memberships.map((m) => m.userId))];
      const profiles = await client
        .from("profiles")
        .select("id, full_name, phone, country, region, city")
        .in("id", userIds);
      if (profiles.error) {
        throw mapSupabaseError(
          profiles.error,
          "Requester details could not be loaded.",
        );
      }
      const profileById = new Map(
        (profiles.data ?? []).map((row) => [row.id, row]),
      );
      return memberships.map((membership) => {
        const profile = profileById.get(membership.userId);
        return {
          ...membership,
          memberFullName: profile?.full_name ?? "",
          memberPhone: profile?.phone ?? "",
          memberCity: profile?.city ?? "",
          memberRegion: profile?.region ?? "",
          memberCountry: profile?.country ?? "",
        };
      });
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
      const membership = mapMembershipRow(data);
      notifyAffiliationOutcome(client, membership);
      return membership;
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
      const membership = mapMembershipRow(data);
      notifyAffiliationOutcome(client, membership);
      return membership;
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
