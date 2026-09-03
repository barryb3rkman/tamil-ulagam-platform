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
  readonly officialEmailVerifiedAt: string | null;
  readonly officialEmailVerificationSentAt: string | null;
  readonly createdAt: string;
  updatedAt: string;
}

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
  networkAffiliated: "yes" | "no" | "";
  networkName: string;
  memberCount: string;
  spocFullName: string;
  spocEmail: string;
  spocPhone: string;
  presidentFullName: string;
  presidentEmail: string;
  presidentPhone: string;
  registrationDocumentPath: string;
  registrationDocumentFilename: string;
  readonly registrationDocumentUploadedAt: string;
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

export function isTamilSangamProfile(
  profile: OrganisationCategoryProfile | null,
): boolean {
  return (
    profile?.category === "tamil_community" &&
    profile.subtype.trim().toLowerCase() === "tamil sangam"
  );
}
