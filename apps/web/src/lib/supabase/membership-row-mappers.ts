import type {
  EligibleOrganisation,
  ManagementGrant,
  Membership,
  MembershipHistoryEvent,
} from "@tamil-ulagam/shared";

import type { Database, Tables } from "@/lib/supabase/database.types";

/**
 * Kept separate from database-row-mappers.ts deliberately, matching the
 * config/join-images.ts precedent: the membership domain (Phase A1) can
 * evolve independently of the existing enrollment row-mapping file
 * without risking it.
 */

export type OrganizationManagerRow = Tables<"organization_managers">;
export type OrganizationMembershipRow = Tables<"organization_memberships">;
export type OrganizationMembershipHistoryRow =
  Tables<"organization_membership_history">;
export type EligibleOrganisationRow =
  Database["public"]["Functions"]["list_membership_eligible_organizations"]["Returns"][number];

export function mapManagementGrantRow(
  row: OrganizationManagerRow,
): ManagementGrant {
  return {
    id: row.id,
    organisationId: row.organization_id,
    userId: row.user_id,
    role: row.role,
    grantedAt: row.granted_at,
    grantedBy: row.granted_by,
  };
}

export function mapMembershipRow(row: OrganizationMembershipRow): Membership {
  return {
    id: row.id,
    organisationId: row.organization_id,
    userId: row.user_id,
    status: row.status,
    membershipType: row.membership_type ?? "",
    requestedAt: row.requested_at,
    invitedAt: row.invited_at,
    invitedBy: row.invited_by,
    decidedAt: row.decided_at,
    decidedBy: row.decided_by,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMembershipHistoryRow(
  row: OrganizationMembershipHistoryRow,
): MembershipHistoryEvent {
  return {
    id: row.id,
    membershipId: row.membership_id,
    actorUserId: row.actor_user_id ?? "",
    previousStatus: row.previous_status ?? "",
    newStatus: row.new_status,
    note: row.note ?? "",
    createdAt: row.created_at,
  };
}

export function mapEligibleOrganisationRow(
  row: EligibleOrganisationRow,
): EligibleOrganisation {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? "",
    city: row.city,
    region: row.region,
    country: row.country,
  };
}
