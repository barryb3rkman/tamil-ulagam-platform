import type { OrganisationCategory } from "./enrollment";

export type MembershipStatus = "pending" | "approved" | "rejected" | "revoked";

export type MembershipType =
  "general" | "student" | "lifetime" | "honorary" | "";

export type OrganizationManagerRole = "owner" | "admin" | "representative";

export interface Membership {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly status: MembershipStatus;
  readonly membershipType: MembershipType;
  readonly requestedAt: string | null;
  readonly invitedAt: string | null;
  readonly invitedBy: string | null;
  readonly decidedAt: string | null;
  readonly decidedBy: string | null;
  readonly expiresAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly memberEmail: string;
  readonly connectionType: string;
  readonly connectionContext: string;
  readonly connectionContextExtra: string;
}

export interface MembershipHistoryEvent {
  readonly id: string;
  readonly membershipId: string;
  readonly actorUserId: string;
  readonly previousStatus: MembershipStatus | "";
  readonly newStatus: MembershipStatus;
  readonly note: string;
  readonly createdAt: string;
}

export interface ManagementGrant {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly role: OrganizationManagerRole;
  readonly grantedAt: string;
  readonly grantedBy: string | null;
}

export interface EligibleOrganisation {
  readonly id: string;
  readonly name: string;
  readonly category: OrganisationCategory | "";
  readonly subtype: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
}

export function isTamilSangam(organisation: EligibleOrganisation): boolean {
  return (
    organisation.category === "tamil_community" &&
    organisation.subtype.trim().toLowerCase() === "tamil sangam"
  );
}

export interface MembershipRequestSummary extends Membership {
  readonly memberFullName: string;
  readonly memberPhone: string;
  readonly memberCity: string;
  readonly memberRegion: string;
  readonly memberCountry: string;
}

export interface MemberProfile {
  fullName: string;
  phone: string;
  country: string;
  region: string;
  city: string;
}

export interface CategoryConnectionOption {
  readonly value: string;
  readonly label: string;
}

export interface CategoryConnectionQuestion {
  readonly prompt: string;
  readonly options: readonly CategoryConnectionOption[];
  readonly contextLabel?: string;
  readonly contextPlaceholder?: string;
  readonly contextOnlyForOptions?: readonly string[];
  readonly extraLabel?: string;
  readonly extraPlaceholder?: string;
}
