import type {
  AdminActivityDomain,
  MembershipStatus,
  OrganisationCategory,
  PartnershipArea,
  PartnershipStatus,
  RegistrationStatus,
} from "@tamil-ulagam/shared";
import type { BadgeProps } from "@tamil-ulagam/ui";

interface StatusPresentation {
  readonly label: string;
  readonly tone: BadgeProps["tone"];
}

export const partnershipAreaLabels: Record<PartnershipArea, string> = {
  strategic: "Strategic",
  community: "Community",
  education: "Education",
  healthcare: "Healthcare",
  business: "Business",
  events: "Events",
  technology: "Technology",
  research: "Research",
  sponsorship: "Sponsorship",
  cultural: "Cultural",
  other: "Other",
};

export const partnershipStatusPresentation: Record<
  PartnershipStatus,
  StatusPresentation
> = {
  new: { label: "New", tone: "warning" },
  in_discussion: { label: "In discussion", tone: "neutral" },
  active: { label: "Active", tone: "success" },
  declined: { label: "Declined", tone: "maroon" },
};

export const membershipStatusPresentation: Record<
  MembershipStatus,
  StatusPresentation
> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "maroon" },
  revoked: { label: "Revoked", tone: "neutral" },
};

export const registrationStatusPresentation: Record<
  RegistrationStatus,
  StatusPresentation
> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "warning" },
  under_review: { label: "Under review", tone: "neutral" },
  needs_changes: { label: "Changes requested", tone: "warning" },
  verified: { label: "Verified", tone: "success" },
  rejected: { label: "Rejected", tone: "maroon" },
  suspended: { label: "Suspended", tone: "maroon" },
};

export const categoryLabels: Record<OrganisationCategory, string> = {
  tamil_community: "Tamil / Community",
  education: "Education",
  healthcare: "Healthcare",
  business: "Business",
  nonprofit: "NGO / Non-profit",
  other: "Other",
};

export const activityDomainLabels: Record<AdminActivityDomain, string> = {
  registration: "Registration",
  membership: "Membership",
  partnership: "Partnership",
};

export function formatOperationalDate(value: string | null): string {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
