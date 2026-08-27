import type {
  ManagementHistoryEvent,
  ManagerInvitation,
  ManagerWithProfile,
  MyManagementInvitation,
  OrganizationManagerRole,
  PreviousOwnerOutcome,
} from "@tamil-ulagam/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { mapSupabaseError } from "@/lib/supabase/errors";

/**
 * MANAGEMENT ADMINISTRATION service boundary (Phase G1).
 *
 * Deliberately its own module rather than folded into
 * membership-service.ts (Phase A1) — Membership and Management are kept
 * conceptually and structurally separate throughout this codebase, and
 * mixing their service layers would blur exactly the distinction the
 * product depends on. Every write here is a narrow RPC; no UI component
 * or hook ever writes organization_managers/organization_manager_invitations/
 * organization_manager_history directly.
 */

type ManagerRow =
  Database["public"]["Functions"]["list_organization_managers"]["Returns"][number];
type PlainManagerRow =
  Database["public"]["Tables"]["organization_managers"]["Row"];
type InvitationRow =
  Database["public"]["Tables"]["organization_manager_invitations"]["Row"];
type MyInvitationRow =
  Database["public"]["Functions"]["list_my_management_invitations"]["Returns"][number];
type HistoryRow =
  Database["public"]["Functions"]["list_organization_management_history"]["Returns"][number];

function mapManagerRow(row: ManagerRow): ManagerWithProfile {
  return {
    id: row.id,
    organisationId: row.organization_id,
    userId: row.user_id,
    role: row.role,
    grantedAt: row.granted_at,
    grantedBy: row.granted_by,
    fullName: row.full_name,
  };
}

/** accept/changeManagerRole return the plain organization_managers row
 * (no profile join — the caller already knows or can refetch the name
 * via listManagers), so this maps that shape directly rather than
 * forcing it through mapManagerRow's enriched-row type. */
function mapPlainManagerRow(row: PlainManagerRow): ManagerWithProfile {
  return {
    id: row.id,
    organisationId: row.organization_id,
    userId: row.user_id,
    role: row.role,
    grantedAt: row.granted_at,
    grantedBy: row.granted_by,
    fullName: "",
  };
}

function mapInvitationRow(row: InvitationRow): ManagerInvitation {
  return {
    id: row.id,
    organisationId: row.organization_id,
    email: row.email,
    role: row.role,
    status: row.status,
    invitedBy: row.invited_by,
    invitedAt: row.invited_at,
    expiresAt: row.expires_at,
    acceptedBy: row.accepted_by,
    acceptedAt: row.accepted_at,
    declinedAt: row.declined_at,
    revokedAt: row.revoked_at,
  };
}

function mapMyInvitationRow(row: MyInvitationRow): MyManagementInvitation {
  return {
    id: row.id,
    organisationId: row.organization_id,
    organisationName: row.organization_name,
    organisationKind:
      row.organization_kind === "sangam" ? "sangam" : "organisation",
    role: row.role,
    status: row.status,
    invitedBy: row.invited_by,
    inviterName: row.inviter_name,
    invitedAt: row.invited_at,
    expiresAt: row.expires_at,
  };
}

function mapHistoryRow(row: HistoryRow): ManagementHistoryEvent {
  return {
    id: row.id,
    organisationId: row.organization_id,
    managerUserId: row.manager_user_id,
    managerName: row.manager_name,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    eventType: row.event_type,
    previousRole: row.previous_role,
    newRole: row.new_role,
    invitationId: row.invitation_id,
    note: row.note,
    createdAt: row.created_at,
  };
}

export interface ManagementService {
  /** Active managers of the given organisation/Sangam, with the minimal
   * co-manager display name (never phone/country/account email). */
  listManagers(organisationId: string): Promise<ManagerWithProfile[]>;
  /** Invitations of every status for the given organisation — the UI is
   * responsible for splitting pending from decided (brief section 13). */
  listInvitations(organisationId: string): Promise<ManagerInvitation[]>;
  /** Owner-only. Rejects: not owner, already a manager, an existing
   * pending invitation for the same email, inviting yourself. */
  inviteManager(
    organisationId: string,
    email: string,
    role: OrganizationManagerRole,
  ): Promise<ManagerInvitation>;
  /** Owner-only; only a pending invitation can be revoked. */
  revokeInvitation(invitationId: string): Promise<ManagerInvitation>;
  /** The caller's own pending invitations, across every organisation,
   * matched by their authenticated account's own email. */
  listMyInvitations(): Promise<MyManagementInvitation[]>;
  /** Only the account whose email matches the invitation may accept.
   * Never creates an ordinary Membership row. */
  acceptInvitation(invitationId: string): Promise<ManagerWithProfile>;
  declineInvitation(invitationId: string): Promise<ManagerInvitation>;
  /** Owner-only; target must currently be admin or representative — the
   * owner's own role only ever changes through transferOwnership. */
  changeManagerRole(
    organisationId: string,
    userId: string,
    newRole: OrganizationManagerRole,
  ): Promise<ManagerWithProfile>;
  /** Owner-only; the owner cannot be removed this way. */
  removeManager(organisationId: string, userId: string): Promise<void>;
  /** Self-service for a non-owner manager; the owner must transfer
   * ownership first. */
  leaveManagement(organisationId: string): Promise<void>;
  /** Owner-only, atomic. previousOwnerOutcome is an explicit caller
   * choice — never implicit. */
  transferOwnership(
    organisationId: string,
    newOwnerUserId: string,
    previousOwnerOutcome: PreviousOwnerOutcome,
  ): Promise<void>;
  listHistory(organisationId: string): Promise<ManagementHistoryEvent[]>;
}

export function createManagementService(
  client: SupabaseClient<Database>,
): ManagementService {
  return {
    async listManagers(organisationId) {
      const { data, error } = await client.rpc("list_organization_managers", {
        target_organization_id: organisationId,
      });
      if (error) throw mapSupabaseError(error, "Managers could not be loaded.");
      return (data ?? []).map(mapManagerRow);
    },

    async listInvitations(organisationId) {
      const { data, error } = await client.rpc(
        "list_organization_manager_invitations",
        { target_organization_id: organisationId },
      );
      if (error)
        throw mapSupabaseError(error, "Invitations could not be loaded.");
      return (data ?? []).map(mapInvitationRow);
    },

    async inviteManager(organisationId, email, role) {
      const { data, error } = await client.rpc("invite_organization_manager", {
        target_organization_id: organisationId,
        invitee_email: email,
        invitee_role: role,
      });
      if (error)
        throw mapSupabaseError(error, "The invitation could not be sent.");
      return mapInvitationRow(data);
    },

    async revokeInvitation(invitationId) {
      const { data, error } = await client.rpc(
        "revoke_organization_manager_invitation",
        { target_invitation_id: invitationId },
      );
      if (error)
        throw mapSupabaseError(error, "The invitation could not be revoked.");
      return mapInvitationRow(data);
    },

    async listMyInvitations() {
      const { data, error } = await client.rpc(
        "list_my_management_invitations",
      );
      if (error)
        throw mapSupabaseError(
          error,
          "Your management invitations could not be loaded.",
        );
      return (data ?? []).map(mapMyInvitationRow);
    },

    async acceptInvitation(invitationId) {
      const { data, error } = await client.rpc(
        "accept_organization_manager_invitation",
        { target_invitation_id: invitationId },
      );
      if (error)
        throw mapSupabaseError(error, "The invitation could not be accepted.");
      return mapPlainManagerRow(data);
    },

    async declineInvitation(invitationId) {
      const { data, error } = await client.rpc(
        "decline_organization_manager_invitation",
        { target_invitation_id: invitationId },
      );
      if (error)
        throw mapSupabaseError(error, "The invitation could not be declined.");
      return mapInvitationRow(data);
    },

    async changeManagerRole(organisationId, userId, newRole) {
      const { data, error } = await client.rpc(
        "change_organization_manager_role",
        {
          target_organization_id: organisationId,
          target_user_id: userId,
          new_role: newRole,
        },
      );
      if (error)
        throw mapSupabaseError(error, "The role could not be changed.");
      return mapPlainManagerRow(data);
    },

    async removeManager(organisationId, userId) {
      const { error } = await client.rpc("remove_organization_manager", {
        target_organization_id: organisationId,
        target_user_id: userId,
      });
      if (error)
        throw mapSupabaseError(error, "The manager could not be removed.");
    },

    async leaveManagement(organisationId) {
      const { error } = await client.rpc("leave_organization_management", {
        target_organization_id: organisationId,
      });
      if (error)
        throw mapSupabaseError(
          error,
          "You could not be removed from management.",
        );
    },

    async transferOwnership(
      organisationId,
      newOwnerUserId,
      previousOwnerOutcome,
    ) {
      const { error } = await client.rpc("transfer_organization_ownership", {
        target_organization_id: organisationId,
        target_user_id: newOwnerUserId,
        previous_owner_new_role: previousOwnerOutcome,
      });
      if (error)
        throw mapSupabaseError(error, "Ownership could not be transferred.");
    },

    async listHistory(organisationId) {
      const { data, error } = await client.rpc(
        "list_organization_management_history",
        { target_organization_id: organisationId },
      );
      if (error)
        throw mapSupabaseError(
          error,
          "Management history could not be loaded.",
        );
      return (data ?? []).map(mapHistoryRow);
    },
  };
}
