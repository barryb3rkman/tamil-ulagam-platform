import {
  partnershipAreas,
  partnershipStatuses,
  type AdminActivityItem,
  type AdminAttentionSummary,
  type AdminManagerSummary,
  type AdminMembershipSummary,
  type AdminOrganisationSummary,
  type FederationCapabilities,
  type MembershipHistoryEvent,
  type PartnershipEnquiry,
  type PartnershipHistoryEvent,
  type PartnershipStatus,
} from "@tamil-ulagam/shared";

import type { AdminOperationsService } from "./admin-operations-service";

const storageKey = "tamil-ulagam-admin-operations-v1";

interface MockOperationsState {
  partnerships: PartnershipEnquiry[];
  partnershipHistory: PartnershipHistoryEvent[];
}

const organisations: readonly AdminOrganisationSummary[] = [
  {
    id: "mock-org-toronto",
    name: "Toronto Tamil Sangam",
    kind: "sangam",
    category: "tamil_community",
    subtype: "Tamil Sangam",
    country: "Canada",
    region: "Ontario",
    city: "Toronto",
    description: "A Tamil community organisation serving the Toronto area.",
    registrationStatus: "registered",
    applicationStatus: "verified",
    officialEmailVerifiedAt: "2026-08-12T09:00:00.000Z",
    networkAffiliated: true,
    networkName: "Regional Tamil network",
    managerCount: 2,
    memberCount: 184,
    updatedAt: "2026-08-24T09:00:00.000Z",
  },
  {
    id: "mock-org-learning",
    name: "Global Tamil Learning Institute",
    kind: "organisation",
    category: "education",
    subtype: "",
    country: "United Kingdom",
    region: "Greater London",
    city: "London",
    description: "An education organisation focused on Tamil learning.",
    registrationStatus: "registered",
    applicationStatus: "verified",
    officialEmailVerifiedAt: "2026-08-10T09:00:00.000Z",
    networkAffiliated: null,
    networkName: "",
    managerCount: 1,
    memberCount: 42,
    updatedAt: "2026-08-22T09:00:00.000Z",
  },
] as const;

const memberships: readonly AdminMembershipSummary[] = [
  {
    id: "mock-membership-pending",
    organisationId: "mock-org-toronto",
    organisationName: "Toronto Tamil Sangam",
    organisationKind: "sangam",
    userId: "mock-member-one",
    memberFullName: "Arun Kumar",
    memberEmail: "demo@tamilulagam.org",
    status: "pending",
    membershipType: "general",
    requestedAt: "2026-08-25T09:00:00.000Z",
    invitedAt: null,
    decidedAt: null,
    decidedByName: "",
    createdAt: "2026-08-25T09:00:00.000Z",
  },
] as const;

export function createMockAdminOperationsService(): AdminOperationsService {
  let membershipState = memberships.map((item) => ({ ...item }));
  return {
    async getCapabilities(): Promise<FederationCapabilities> {
      return {
        canReviewRegistrations: true,
        canOperateFederation: true,
      };
    },
    async getAttentionSummary(): Promise<AdminAttentionSummary> {
      const state = readState();
      return {
        registrationReviews: 2,
        registrationFollowUps: 1,
        pendingMemberships: membershipState.filter(
          (item) => item.status === "pending",
        ).length,
        newPartnershipEnquiries: state.partnerships.filter(
          (item) => item.status === "new",
        ).length,
        verifiedOrganisations: organisations.filter(
          (item) =>
            item.kind === "organisation" &&
            item.applicationStatus === "verified",
        ).length,
        verifiedSangams: organisations.filter(
          (item) =>
            item.kind === "sangam" && item.applicationStatus === "verified",
        ).length,
      };
    },
    async listOrganisations() {
      return organisations.map((item) => ({ ...item }));
    },
    async listOrganisationManagers(
      organisationId,
    ): Promise<AdminManagerSummary[]> {
      const organisation = organisations.find(
        (item) => item.id === organisationId,
      );
      return organisation
        ? [
            {
              id: `manager-${organisationId}`,
              organisationId,
              userId: "mock-manager",
              fullName: "Arun Kumar",
              role: "owner",
              grantedAt: "2026-08-01T09:00:00.000Z",
            },
          ]
        : [];
    },
    async listMemberships() {
      return membershipState.map((item) => ({ ...item }));
    },
    async listMembershipHistory(): Promise<MembershipHistoryEvent[]> {
      return [];
    },
    async decideMembership(membershipId, action) {
      membershipState = membershipState.map((item) =>
        item.id === membershipId
          ? {
              ...item,
              status:
                action === "approve"
                  ? "approved"
                  : action === "reject"
                    ? "rejected"
                    : "revoked",
              decidedAt: new Date().toISOString(),
              decidedByName: "Federation Admin",
            }
          : item,
      );
    },
    async submitPartnershipEnquiry(input) {
      const state = readState();
      const now = new Date().toISOString();
      const id = globalThis.crypto.randomUUID();
      state.partnerships.unshift({
        id,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        organisationName: input.organisationName.trim(),
        country: input.country.trim(),
        area: input.area,
        message: input.message.trim(),
        status: "new",
        createdAt: now,
        updatedAt: now,
      });
      state.partnershipHistory.unshift({
        id: globalThis.crypto.randomUUID(),
        enquiryId: id,
        previousStatus: "",
        newStatus: "new",
        actorUserId: "",
        actorName: "Public enquiry",
        note: "Enquiry received.",
        createdAt: now,
      });
      writeState(state);
      return id;
    },
    async listPartnershipEnquiries() {
      return readState().partnerships;
    },
    async listPartnershipHistory(enquiryId) {
      return readState().partnershipHistory.filter(
        (event) => event.enquiryId === enquiryId,
      );
    },
    async transitionPartnership(enquiryId, status, note) {
      const state = readState();
      const current = state.partnerships.find((item) => item.id === enquiryId);
      if (!current) throw new Error("Partnership enquiry not found.");
      const previousStatus = current.status;
      const updated = {
        ...current,
        status,
        updatedAt: new Date().toISOString(),
      };
      state.partnerships = state.partnerships.map((item) =>
        item.id === enquiryId ? updated : item,
      );
      state.partnershipHistory.unshift({
        id: globalThis.crypto.randomUUID(),
        enquiryId,
        previousStatus,
        newStatus: status,
        actorUserId: "mock-admin",
        actorName: "Federation Admin",
        note: note?.trim() ?? "",
        createdAt: updated.updatedAt,
      });
      writeState(state);
      return updated;
    },
    async listRecentActivity(): Promise<AdminActivityItem[]> {
      return readState().partnershipHistory.map((event) => ({
        id: event.id,
        domain: "partnership",
        title: "Partnership enquiry",
        description: "Partnership enquiry updated",
        status: event.newStatus,
        occurredAt: event.createdAt,
      }));
    },
  };
}

function readState(): MockOperationsState {
  if (typeof window === "undefined")
    return { partnerships: [], partnershipHistory: [] };
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return { partnerships: [], partnershipHistory: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return emptyState();
    const partnerships = Array.isArray(parsed.partnerships)
      ? parsed.partnerships.filter(isPartnershipEnquiry)
      : [];
    const partnershipHistory = Array.isArray(parsed.partnershipHistory)
      ? parsed.partnershipHistory.filter(isPartnershipHistoryEvent)
      : [];
    return { partnerships, partnershipHistory };
  } catch {
    return emptyState();
  }
}

function writeState(state: MockOperationsState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function isPartnershipTransitionAllowed(
  current: PartnershipStatus,
  next: PartnershipStatus,
): boolean {
  return (
    (current === "new" && next === "in_discussion") ||
    (current === "in_discussion" && (next === "active" || next === "declined"))
  );
}

function emptyState(): MockOperationsState {
  return { partnerships: [], partnershipHistory: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isPartnershipStatus(value: unknown): value is PartnershipStatus {
  return partnershipStatuses.some((status) => status === value);
}

function isPartnershipArea(
  value: unknown,
): value is PartnershipEnquiry["area"] {
  return partnershipAreas.some((area) => area === value);
}

function isPartnershipEnquiry(value: unknown): value is PartnershipEnquiry {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.email) &&
    isString(value.organisationName) &&
    isString(value.country) &&
    isPartnershipArea(value.area) &&
    isString(value.message) &&
    isPartnershipStatus(value.status) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isPartnershipHistoryEvent(
  value: unknown,
): value is PartnershipHistoryEvent {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.enquiryId) &&
    (value.previousStatus === "" ||
      isPartnershipStatus(value.previousStatus)) &&
    isPartnershipStatus(value.newStatus) &&
    isString(value.actorUserId) &&
    isString(value.actorName) &&
    isString(value.note) &&
    isString(value.createdAt)
  );
}
