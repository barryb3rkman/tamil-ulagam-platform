export type OrganisationCategory =
  | "tamil_community"
  | "education"
  | "healthcare"
  | "business"
  | "nonprofit"
  | "other";

export type RegistrationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "needs_changes"
  | "verified"
  | "rejected"
  | "suspended";

export interface UserProfile {
  readonly id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  /** Platform Terms of Use / Privacy Policy consent, set once at signup. Never client-updatable afterward. */
  readonly termsAcceptedAt: string | null;
  readonly createdAt: string;
}

export interface Organisation {
  readonly id: string;
  category: OrganisationCategory | "";
  name: string;
  country: string;
  region: string;
  city: string;
  streetAddress: string;
  postalCode: string;
  officialEmail: string;
  officialPhone: string;
  website: string;
  yearEstablished: string;
  description: string;
  registrationStatus: "registered" | "informal" | "";
  registrationNumber: string;
  registrationAuthority: string;
  registrationCountry: string;
  logoPreview: string;
  /**
   * Organisation-email verification (distinct from account-email
   * confirmation): proves control of the declared official contact
   * inbox. A strong admin-visible trust signal, never required to
   * submit an application.
   */
  readonly officialEmailVerifiedAt: string | null;
  readonly officialEmailVerificationSentAt: string | null;
  readonly createdAt: string;
  updatedAt: string;
}

/**
 * Booleans are safe for any authenticated caller (a gentle pre-submission
 * warning). `matches` is only ever populated for reviewers — ordinary
 * applicants never receive another organisation's identifying details.
 */
export interface DuplicateOrganisationSignals {
  readonly nameMatch: boolean;
  readonly emailMatch: boolean;
  readonly registrationNumberMatch: boolean;
  readonly matches: readonly { readonly id: string; readonly name: string }[];
}

export interface OrganisationMembership {
  readonly id: string;
  readonly userId: string;
  readonly organisationId: string;
  role: "owner" | "representative" | "admin";
  isPrimary: boolean;
  readonly createdAt: string;
}

export interface OrganisationRepresentative {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  relationship:
    | "founder"
    | "president"
    | "secretary"
    | "director"
    | "administrator"
    | "employee"
    | "authorised_representative"
    | "other"
    | "";
  authorisedDeclaration: boolean;
  accuracyDeclaration: boolean;
}

export interface TamilCommunityProfile {
  readonly category: "tamil_community";
  subtype: string;
  primaryActivities: string[];
  membershipSize: string;
  geographicAreaServed: string;
  chairpersonName: string;
  secretaryName: string;
  languages: string;
  /**
   * Tamil Sangam registration (Phase D1) only: "Is your Sangam already
   * connected to a regional, national or international Tamil
   * network/federation?" — optional, so "" doubles as both "not
   * answered" and "prefer not to say" (the same convention already used
   * by `tamilProgrammesOffered`/`licensed` elsewhere in this file).
   * Meaningless for a plain tamil_community organisation registered
   * through the generic Organisation wizard; left "" there.
   */
  networkAffiliated: "yes" | "no" | "";
  /** Only meaningful when networkAffiliated is "yes"; optional even then. */
  networkName: string;
  /**
   * Phase H3 (Tamil Sangam registration V2) — genuinely new Sangam-only
   * fields. All stay at their empty defaults for a plain tamil_community
   * organisation registered through the generic Organisation wizard,
   * which never asks for or writes them — the same "unused elsewhere"
   * convention chairpersonName/secretaryName above already establish.
   *
   * memberCount is kept as a string (not a number) at the domain layer,
   * matching yearEstablished's own string-for-a-numeric-column
   * convention — form inputs bind directly to it without a parse step,
   * and the mapper layer (domain-mappers.ts) is the single place that
   * converts to/from the underlying integer column.
   */
  memberCount: string;
  spocFullName: string;
  spocEmail: string;
  spocPhone: string;
  presidentFullName: string;
  presidentEmail: string;
  presidentPhone: string;
  /** Storage object path (e.g. "<applicationId>/<generatedName>.pdf") —
   * never a URL. Resolved to a short-lived signed URL on demand by the
   * Sangam service; never persisted as a URL anywhere. */
  registrationDocumentPath: string;
  /** The original filename the applicant uploaded, kept purely for
   * display — the storage object's own key is a generated name (H3
   * brief section 11), never the user-supplied filename. */
  registrationDocumentFilename: string;
  readonly registrationDocumentUploadedAt: string;
  /** Zero or more social profile URLs, in the order the applicant added
   * them (H3 brief section 16) — Sangam-only, same "stays empty
   * elsewhere" convention as the rest of this block. */
  socialLinks: string[];
}

export interface EducationProfile {
  readonly category: "education";
  institutionType: string;
  governanceType: string;
  tamilProgrammesOffered: "yes" | "no" | "";
  tamilProgrammesDescription: string;
  accreditationAuthority: string;
  accreditationNumber: string;
  studentPopulation: string;
  studyAreas: string[];
}

export interface HealthcareProfile {
  readonly category: "healthcare";
  facilityType: string;
  ownershipType: string;
  systemsOfMedicine: string[];
  mainServices: string;
  licensed: "yes" | "no" | "";
  licenceNumber: string;
  licensingAuthority: string;
  twentyFourSeven: boolean;
  emergencyServices: boolean;
  numberOfBeds: string;
}

export interface BusinessProfile {
  readonly category: "business";
  businessType: string;
  industry: string;
  productsServices: string;
  employeeSize: string;
  operatingCountries: string;
}

export interface NonprofitProfile {
  readonly category: "nonprofit";
  subtype: string;
  primaryAreas: string[];
  beneficiaryRegions: string;
  organisationSize: string;
}

export interface OtherOrganisationProfile {
  readonly category: "other";
  organisationType: string;
  primaryPurpose: string;
}

export type OrganisationCategoryProfile =
  | TamilCommunityProfile
  | EducationProfile
  | HealthcareProfile
  | BusinessProfile
  | NonprofitProfile
  | OtherOrganisationProfile;

export interface OrganisationRegistration {
  readonly id: string;
  readonly organisationId: string;
  readonly applicantUserId: string;
  status: RegistrationStatus;
  currentStep: 1 | 2 | 3 | 4;
  categoryProfile: OrganisationCategoryProfile | null;
  representative: OrganisationRepresentative;
  adminFeedback: string;
  submittedAt: string;
  reviewedAt: string;
  reviewedBy: string;
  readonly createdAt: string;
  updatedAt: string;
}

export interface ApplicationReviewEvent {
  readonly id: string;
  readonly applicationId: string;
  readonly actorUserId: string;
  readonly previousStatus: RegistrationStatus | "";
  readonly newStatus: RegistrationStatus;
  readonly feedback: string;
  readonly createdAt: string;
}

export interface OrganisationApplication {
  readonly organisation: Organisation;
  readonly registration: OrganisationRegistration;
  readonly representativeUser: UserProfile;
  readonly reviewHistory?: readonly ApplicationReviewEvent[];
}

export interface EnrollmentPlatformState {
  readonly version: 1;
  currentUserId: string | null;
  users: UserProfile[];
  organisations: Organisation[];
  memberships: OrganisationMembership[];
  registrations: OrganisationRegistration[];
  reviewHistory?: ApplicationReviewEvent[];
}

export type MockPlatformState = EnrollmentPlatformState;

/**
 * True only for a tamil_community application whose recorded subtype is
 * exactly (case/whitespace-insensitively) "Tamil Sangam" — the same rule
 * `isTamilSangam` (membership.ts) applies to the narrower
 * `EligibleOrganisation` projection, applied here to the richer
 * registration-time shape. Never derived from the organisation's name.
 * Used to keep the Sangam journey's own draft resolution (Phase D1)
 * from ever being confused with a plain Organisation record, and vice
 * versa — see ensure_sangam_application_draft and the
 * currentApplicationFromState exclusion filter in supabase-services.ts/
 * platform-provider.tsx.
 */
export function isTamilSangamProfile(
  profile: OrganisationCategoryProfile | null,
): boolean {
  return (
    profile?.category === "tamil_community" &&
    profile.subtype.trim().toLowerCase() === "tamil sangam"
  );
}
