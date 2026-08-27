import type {
  AdminActivityItem,
  AdminAttentionSummary,
  AdminManagerSummary,
  AdminMembershipSummary,
  AdminOrganisationSummary,
  FederationCapabilities,
  MembershipHistoryEvent,
  PartnershipEnquiry,
  PartnershipEnquiryInput,
  PartnershipHistoryEvent,
  PartnershipStatus,
} from "@tamil-ulagam/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { mapSupabaseError, PlatformServiceError } from "@/lib/supabase/errors";
import { mapMembershipHistoryRow } from "@/lib/supabase/membership-row-mappers";

export interface AdminOperationsService {
  getCapabilities(): Promise<FederationCapabilities>;
  getAttentionSummary(): Promise<AdminAttentionSummary>;
  listOrganisations(): Promise<AdminOrganisationSummary[]>;
  listOrganisationManagers(
    organisationId: string,
  ): Promise<AdminManagerSummary[]>;
  listMemberships(): Promise<AdminMembershipSummary[]>;
  listMembershipHistory(
    membershipId: string,
  ): Promise<MembershipHistoryEvent[]>;
  decideMembership(
    membershipId: string,
    action: "approve" | "reject" | "revoke",
    note?: string,
  ): Promise<void>;
  submitPartnershipEnquiry(input: PartnershipEnquiryInput): Promise<string>;
  listPartnershipEnquiries(): Promise<PartnershipEnquiry[]>;
  listPartnershipHistory(enquiryId: string): Promise<PartnershipHistoryEvent[]>;
  transitionPartnership(
    enquiryId: string,
    status: Exclude<PartnershipStatus, "new">,
    note?: string,
  ): Promise<PartnershipEnquiry>;
  listRecentActivity(limit?: number): Promise<AdminActivityItem[]>;
}

export function createAdminOperationsService(
  client: SupabaseClient<Database>,
): AdminOperationsService {
  return {
    async getCapabilities() {
      const { data, error } = await client.rpc("get_federation_capabilities");
      if (error)
        throw mapSupabaseError(error, "Admin access could not be checked.");
      const row = data?.[0];
      return {
        canReviewRegistrations: row?.can_review_registrations ?? false,
        canOperateFederation: row?.can_operate_federation ?? false,
      };
    },

    async getAttentionSummary() {
      const { data, error } = await client.rpc("get_admin_attention_summary");
      if (error)
        throw mapSupabaseError(
          error,
          "Federation attention items could not be loaded.",
        );
      const row = data?.[0];
      return {
        registrationReviews: row?.registration_reviews ?? 0,
        registrationFollowUps: row?.registration_follow_ups ?? 0,
        pendingMemberships: row?.pending_memberships ?? 0,
        newPartnershipEnquiries: row?.new_partnership_enquiries ?? 0,
        verifiedOrganisations: row?.verified_organizations ?? 0,
        verifiedSangams: row?.verified_sangams ?? 0,
      };
    },

    async listOrganisations() {
      const { data, error } = await client.rpc(
        "list_admin_organization_operations",
      );
      if (error)
        throw mapSupabaseError(
          error,
          "The Federation directory could not be loaded.",
        );
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        kind: row.kind === "sangam" ? "sangam" : "organisation",
        category: row.category ?? "",
        subtype: row.subtype,
        country: row.country,
        region: row.region,
        city: row.city,
        description: row.description,
        registrationStatus: row.registration_status ?? "",
        applicationStatus: row.application_status,
        officialEmailVerifiedAt: row.official_email_verified_at ?? null,
        networkAffiliated: row.network_affiliated ?? null,
        networkName: row.network_name,
        managerCount: Number(row.manager_count),
        memberCount: Number(row.member_count),
        updatedAt: row.updated_at,
      }));
    },

    async listOrganisationManagers(organisationId) {
      const { data, error } = await client.rpc(
        "list_admin_organization_managers",
        { target_organization_id: organisationId },
      );
      if (error)
        throw mapSupabaseError(
          error,
          "Organisation managers could not be loaded.",
        );
      return (data ?? []).map((row) => ({
        id: row.id,
        organisationId: row.organization_id,
        userId: row.user_id,
        fullName: row.full_name,
        role: row.role,
        grantedAt: row.granted_at,
      }));
    },

    async listMemberships() {
      const { data, error } = await client.rpc(
        "list_admin_membership_operations",
      );
      if (error)
        throw mapSupabaseError(
          error,
          "Membership operations could not be loaded.",
        );
      return (data ?? []).map((row) => ({
        id: row.id,
        organisationId: row.organization_id,
        organisationName: row.organization_name,
        organisationKind:
          row.organization_kind === "sangam" ? "sangam" : "organisation",
        userId: row.user_id,
        memberFullName: row.member_full_name,
        memberEmail: row.member_email,
        status: row.status,
        membershipType: row.membership_type,
        requestedAt: row.requested_at ?? null,
        invitedAt: row.invited_at ?? null,
        decidedAt: row.decided_at ?? null,
        decidedByName: row.decided_by_name,
        createdAt: row.created_at,
      }));
    },

    async listMembershipHistory(membershipId) {
      const { data, error } = await client
        .from("organization_membership_history")
        .select("*")
        .eq("membership_id", membershipId)
        .order("created_at", { ascending: false });
      if (error)
        throw mapSupabaseError(
          error,
          "Membership history could not be loaded.",
        );
      return (data ?? []).map(mapMembershipHistoryRow);
    },

    async decideMembership(membershipId, action, note) {
      if (action === "revoke") {
        const { error } = await client.rpc("revoke_organization_membership", {
          target_membership_id: membershipId,
          decision_note: note,
        });
        if (error)
          throw mapSupabaseError(error, "The membership could not be revoked.");
        return;
      }
      const { error } = await client.rpc("decide_organization_membership", {
        target_membership_id: membershipId,
        target_status: action === "approve" ? "approved" : "rejected",
        decision_note: note,
      });
      if (error)
        throw mapSupabaseError(error, "The membership decision failed.");
    },

    async submitPartnershipEnquiry(input) {
      const { data, error } = await client.rpc("submit_partnership_enquiry", {
        enquiry_name: input.name,
        enquiry_email: input.email,
        enquiry_organization_name: input.organisationName,
        enquiry_country: input.country,
        enquiry_area: input.area,
        enquiry_message: input.message,
      });
      if (error)
        throw mapSupabaseError(error, "Your enquiry could not be sent.");
      if (!data)
        throw new PlatformServiceError(
          "Your enquiry could not be confirmed.",
          "unknown",
        );
      return data;
    },

    async listPartnershipEnquiries() {
      const { data, error } = await client.rpc(
        "list_admin_partnership_enquiries",
      );
      if (error)
        throw mapSupabaseError(
          error,
          "Partnership enquiries could not be loaded.",
        );
      return (data ?? []).map(mapPartnershipEnquiry);
    },

    async listPartnershipHistory(enquiryId) {
      const { data, error } = await client.rpc(
        "list_admin_partnership_history",
        { target_enquiry_id: enquiryId },
      );
      if (error)
        throw mapSupabaseError(
          error,
          "Partnership history could not be loaded.",
        );
      return (data ?? []).map((row) => ({
        id: row.id,
        enquiryId: row.enquiry_id,
        previousStatus: row.previous_status ?? "",
        newStatus: row.new_status,
        actorUserId: row.actor_user_id ?? "",
        actorName: row.actor_name,
        note: row.note,
        createdAt: row.created_at,
      }));
    },

    async transitionPartnership(enquiryId, status, note) {
      const { data, error } = await client.rpc(
        "transition_partnership_enquiry",
        {
          target_enquiry_id: enquiryId,
          target_status: status,
          transition_note: note,
        },
      );
      if (error)
        throw mapSupabaseError(
          error,
          "The partnership status could not be updated.",
        );
      if (!data)
        throw new PlatformServiceError(
          "The partnership update could not be confirmed.",
          "unknown",
        );
      return mapPartnershipEnquiry(data);
    },

    async listRecentActivity(limit = 12) {
      const { data, error } = await client.rpc("list_admin_recent_activity", {
        activity_limit: limit,
      });
      if (error)
        throw mapSupabaseError(
          error,
          "Recent operational activity could not be loaded.",
        );
      return (data ?? []).map((row) => ({
        id: row.id,
        domain:
          row.domain === "membership" || row.domain === "partnership"
            ? row.domain
            : "registration",
        title: row.title,
        description: row.description,
        status: row.status,
        occurredAt: row.occurred_at,
      }));
    },
  };
}

type PartnershipRow =
  Database["public"]["Functions"]["list_admin_partnership_enquiries"]["Returns"][number];

function mapPartnershipEnquiry(row: PartnershipRow): PartnershipEnquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    organisationName: row.organization_name,
    country: row.country,
    area: row.partnership_area,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
