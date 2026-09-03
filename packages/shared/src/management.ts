import type { OrganizationManagerRole } from "./membership";

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

export type PreviousOwnerOutcome = "admin" | "representative" | "leave";
