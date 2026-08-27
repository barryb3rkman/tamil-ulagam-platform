import type { OrganizationManagerRole } from "./membership";

/**
 * MANAGEMENT ADMINISTRATION (Phase G1).
 *
 * Extends the A1 membership/management split with the missing lifecycle:
 * invite a co-manager by email, accept/decline, change role, remove,
 * leave, transfer ownership, and an immutable audit history. Deliberately
 * independent of Membership (Membership) — accepting a management
 * invitation never creates an ordinary affiliation, and none of these
 * types describe belonging, only administrative authority.
 */

export type ManagerInvitationStatus =
  "pending" | "accepted" | "declined" | "expired" | "revoked";

export type ManagementHistoryEventType =
  | "invited"
  | "invitation_accepted"
  | "invitation_declined"
  | "invitation_revoked"
  | "role_changed"
  | "manager_removed"
  | "manager_left"
  | "ownership_transferred";

/** A management grant enriched with the co-manager's own-organisation-
 * scoped display name — never phone/country/account email (see
 * list_organization_managers' narrow projection). */
export interface ManagerWithProfile {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly role: OrganizationManagerRole;
  readonly grantedAt: string;
  readonly grantedBy: string | null;
  readonly fullName: string;
}

export interface ManagerInvitation {
  readonly id: string;
  readonly organisationId: string;
  readonly email: string;
  readonly role: OrganizationManagerRole;
  readonly status: ManagerInvitationStatus;
  readonly invitedBy: string | null;
  readonly invitedAt: string;
  readonly expiresAt: string;
  readonly acceptedBy: string | null;
  readonly acceptedAt: string | null;
  readonly declinedAt: string | null;
  readonly revokedAt: string | null;
}

/** The recipient's own view of one pending invitation — enough to
 * render the acceptance screen without a second round trip. */
export interface MyManagementInvitation {
  readonly id: string;
  readonly organisationId: string;
  readonly organisationName: string;
  readonly organisationKind: "organisation" | "sangam";
  readonly role: OrganizationManagerRole;
  readonly status: ManagerInvitationStatus;
  readonly invitedBy: string | null;
  readonly inviterName: string;
  readonly invitedAt: string;
  readonly expiresAt: string;
}

export interface ManagementHistoryEvent {
  readonly id: string;
  readonly organisationId: string;
  readonly managerUserId: string | null;
  readonly managerName: string;
  readonly actorUserId: string | null;
  readonly actorName: string;
  readonly eventType: ManagementHistoryEventType;
  readonly previousRole: OrganizationManagerRole | null;
  readonly newRole: OrganizationManagerRole | null;
  readonly invitationId: string | null;
  readonly note: string;
  readonly createdAt: string;
}

/** previous_owner_new_role for transfer_organization_ownership — an
 * explicit caller choice (brief section 22), never implicit. */
export type PreviousOwnerOutcome = "admin" | "representative" | "leave";
