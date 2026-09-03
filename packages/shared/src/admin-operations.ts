import type { OrganisationCategory, RegistrationStatus } from "./enrollment";
import type { MembershipStatus, OrganizationManagerRole } from "./membership";

export interface FederationCapabilities {
  readonly canReviewRegistrations: boolean;
  readonly canOperateFederation: boolean;
}

export type AdminEntityKind = "organisation" | "sangam";

export interface AdminOrganisationSummary {
  readonly id: string;
  readonly name: string;
  readonly kind: AdminEntityKind;
  readonly category: OrganisationCategory | "";
  readonly subtype: string;
  readonly country: string;
  readonly region: string;
  readonly city: string;
  readonly description: string;
  readonly registrationStatus: "registered" | "informal" | "";
  readonly applicationStatus: RegistrationStatus;
  readonly officialEmailVerifiedAt: string | null;
  readonly networkAffiliated: boolean | null;
  readonly networkName: string;
  readonly managerCount: number;
  readonly memberCount: number;
  readonly updatedAt: string;
}

export interface AdminManagerSummary {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly fullName: string;
  readonly role: OrganizationManagerRole;
  readonly grantedAt: string;
}

export interface AdminMembershipSummary {
  readonly id: string;
  readonly organisationId: string;
  readonly organisationName: string;
  readonly organisationKind: AdminEntityKind;
  readonly userId: string;
  readonly memberFullName: string;
  readonly memberEmail: string;
  readonly status: MembershipStatus;
  readonly membershipType: string;
  readonly requestedAt: string | null;
  readonly invitedAt: string | null;
  readonly decidedAt: string | null;
  readonly decidedByName: string;
  readonly createdAt: string;
}

export const partnershipAreas = [
  "strategic",
  "community",
  "education",
  "healthcare",
  "business",
  "events",
  "technology",
  "research",
  "sponsorship",
  "cultural",
  "other",
] as const;

export type PartnershipArea = (typeof partnershipAreas)[number];

export const partnershipStatuses = [
  "new",
  "in_discussion",
  "active",
  "declined",
] as const;

export type PartnershipStatus = (typeof partnershipStatuses)[number];

export interface PartnershipEnquiryInput {
  readonly name: string;
  readonly email: string;
  readonly organisationName: string;
  readonly country: string;
  readonly area: PartnershipArea;
  readonly message: string;
  readonly captchaToken?: string;
}

export interface PartnershipEnquiry {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly organisationName: string;
  readonly country: string;
  readonly area: PartnershipArea;
  readonly message: string;
  readonly status: PartnershipStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PartnershipHistoryEvent {
  readonly id: string;
  readonly enquiryId: string;
  readonly previousStatus: PartnershipStatus | "";
  readonly newStatus: PartnershipStatus;
  readonly actorUserId: string;
  readonly actorName: string;
  readonly note: string;
  readonly createdAt: string;
}

export type AdminActivityDomain = "registration" | "membership" | "partnership";

export interface AdminActivityItem {
  readonly id: string;
  readonly domain: AdminActivityDomain;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly occurredAt: string;
}

export interface AdminAttentionSummary {
  readonly registrationReviews: number;
  readonly registrationFollowUps: number;
  readonly pendingMemberships: number;
  readonly newPartnershipEnquiries: number;
  readonly verifiedOrganisations: number;
  readonly verifiedSangams: number;
}
