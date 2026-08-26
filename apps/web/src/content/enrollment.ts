import type {
  OrganisationCategory,
  OrganisationCategoryProfile,
  RegistrationStatus,
} from "@tamil-ulagam/shared";
import { isTamilSangamProfile } from "@tamil-ulagam/shared";

export interface SelectOption<TValue extends string = string> {
  readonly value: TValue;
  readonly label: string;
}

export interface CategoryOption extends SelectOption<OrganisationCategory> {
  readonly description: string;
}

export const organisationCategories = [
  {
    value: "tamil_community",
    label: "Tamil / Community Organisation",
    description: "Associations, sangams, federations and cultural communities.",
  },
  {
    value: "education",
    label: "Education",
    description:
      "Schools, universities, institutes and learning organisations.",
  },
  {
    value: "healthcare",
    label: "Healthcare",
    description:
      "Healthcare facilities and professional service organisations.",
  },
  {
    value: "business",
    label: "Business / Company",
    description: "Companies, practices, co-operatives and enterprises.",
  },
  {
    value: "nonprofit",
    label: "NGO / Non-profit",
    description: "Charities, foundations, trusts and social organisations.",
  },
  {
    value: "other",
    label: "Other Organisation",
    description: "Another organisation type that does not fit these groups.",
  },
] as const satisfies readonly CategoryOption[];

export const registrationStatusPresentation: Record<
  RegistrationStatus,
  {
    readonly label: string;
    readonly title: string;
    readonly tone: "neutral" | "success" | "warning" | "maroon";
    readonly description: string;
  }
> = {
  draft: {
    label: "Draft",
    title: "Complete your organisation registration",
    tone: "neutral",
    description:
      "Continue where you left off and complete the remaining information.",
  },
  submitted: {
    label: "Submitted",
    title: "Registration submitted",
    tone: "neutral",
    description: "Your application has been received and is ready for review.",
  },
  under_review: {
    label: "Under Review",
    title: "Review in progress",
    tone: "warning",
    description:
      "Your registration is being reviewed. No action is required right now.",
  },
  needs_changes: {
    label: "Changes Requested",
    title: "Changes requested",
    tone: "maroon",
    description:
      "Review the feedback and update your application before resubmitting.",
  },
  verified: {
    label: "Verified",
    title: "Verified Organisation",
    tone: "success",
    description: "Your organisation registration has been approved.",
  },
  rejected: {
    label: "Rejected",
    title: "Registration not approved",
    tone: "maroon",
    description: "Review the feedback provided for this registration.",
  },
  suspended: {
    label: "Suspended",
    title: "Registration suspended",
    tone: "maroon",
    description: "Your organisation profile currently has restricted status.",
  },
};

export const registrationSteps = [
  "Organisation",
  "Contact & representative",
  "Registration & trust",
  "Review & submit",
] as const;

export const registrationStatusOptions = [
  { value: "registered", label: "Registered organisation" },
  { value: "informal", label: "Unregistered / informal organisation" },
] as const;

export const representativeRelationships = [
  { value: "founder", label: "Founder" },
  { value: "president", label: "President / Chairperson" },
  { value: "secretary", label: "Secretary" },
  { value: "director", label: "Director" },
  { value: "administrator", label: "Administrator" },
  { value: "employee", label: "Employee" },
  { value: "authorised_representative", label: "Authorised Representative" },
  { value: "other", label: "Other" },
] as const;

/**
 * Lean V2 intake asks for a simplified role grouping instead of the full
 * eight-value relationship enum. Each option maps onto one existing enum
 * value (see mapRepresentativeRole in the wizard) so no stored data or
 * historical record changes shape. The full `representativeRelationships`
 * list above stays in use for displaying already-submitted applications,
 * whatever value they hold.
 */
export const representativeRoleOptions = [
  { value: "leadership", label: "Leadership (founder, president, director)" },
  { value: "staff_administrator", label: "Staff / Administrator" },
  { value: "authorised_representative", label: "Authorised Representative" },
  { value: "other", label: "Other" },
] as const;

export const tamilCommunityOptions = {
  subtypes: [
    "Tamil Sangam",
    "Tamil Association",
    "Tamil Society",
    "Tamil Federation",
    "Cultural Organisation",
    "Community Organisation",
    "Tamil Language Organisation",
    "Other",
  ],
  membershipSizes: [
    "Under 50",
    "50–100",
    "101–250",
    "251–500",
    "501–1,000",
    "1,001–5,000",
    "5,000+",
    "Prefer not to say",
  ],
  activities: [
    "Tamil language education",
    "Cultural programmes",
    "Arts & music",
    "Youth programmes",
    "Community welfare",
    "Senior citizen programmes",
    "Business networking",
    "Professional networking",
    "Sports",
    "Events & festivals",
    "Heritage preservation",
    "Religious / community activities",
    "Other",
  ],
} as const;

export const educationOptions = {
  institutionTypes: [
    "University",
    "College",
    "School",
    "Training Institute",
    "Research Institution",
    "Tamil Language Institute",
    "Educational Trust",
    "Online Education Platform",
    "Other",
  ],
  governanceTypes: [
    "Public / Government",
    "Private",
    "Trust",
    "Non-profit",
    "Other",
  ],
  studyAreas: [
    "Arts & Humanities",
    "Engineering",
    "Medicine",
    "Science",
    "Business",
    "Law",
    "Tamil Studies",
    "Research",
    "Vocational Training",
    "Other",
  ],
} as const;

export const healthcareOptions = {
  facilityTypes: [
    "Hospital",
    "Clinic",
    "Medical Centre",
    "Diagnostic Laboratory",
    "Imaging Centre",
    "Pharmacy",
    "Dental Clinic",
    "Physiotherapy Centre",
    "Mental Health Centre",
    "Traditional Medicine Centre",
    "Blood Bank",
    "Other",
  ],
  ownershipTypes: [
    "Government / Public",
    "Private",
    "NGO / Charitable",
    "Public-private partnership",
    "Other",
  ],
  systems: [
    "Modern Medicine",
    "Siddha",
    "Ayurveda",
    "Unani",
    "Homeopathy",
    "Dentistry",
    "Physiotherapy",
    "Mental Health",
    "Other",
  ],
} as const;

export const businessOptions = {
  types: [
    "Sole Proprietorship",
    "Partnership",
    "Private Company",
    "Public Company",
    "Startup",
    "Professional Practice",
    "Co-operative",
    "Other",
  ],
  industries: [
    "Technology",
    "Healthcare",
    "Education",
    "Retail",
    "Manufacturing",
    "Finance",
    "Professional Services",
    "Media",
    "Hospitality",
    "Tourism",
    "Construction",
    "Real Estate",
    "Import / Export",
    "Food",
    "Transport",
    "Other",
  ],
  employeeSizes: [
    "1",
    "2–10",
    "11–50",
    "51–200",
    "201–500",
    "501–1,000",
    "1,000+",
  ],
} as const;

export const nonprofitOptions = {
  subtypes: [
    "NGO",
    "Charity",
    "Foundation",
    "Trust",
    "Non-profit Association",
    "Community Organisation",
    "Social Enterprise",
    "Other",
  ],
  areas: [
    "Education",
    "Healthcare",
    "Youth",
    "Women",
    "Elder care",
    "Disability support",
    "Poverty relief",
    "Cultural preservation",
    "Community development",
    "Environment",
    "Disaster relief",
    "Research",
    "Other",
  ],
} as const;

export function getCategoryLabel(category: OrganisationCategory | ""): string {
  return (
    organisationCategories.find((option) => option.value === category)?.label ??
    "Organisation"
  );
}

/**
 * "Tamil Sangam" for a Sangam-identified application, otherwise the
 * plain category label (e.g. "Education") — the admin-facing equivalent
 * of organisationKindLabel (components/member/organisation-presentation.ts),
 * which works on the narrower EligibleOrganisation projection instead of
 * an application's own categoryProfile. Reviewers should never see
 * Sangam-specific data under a generic "Tamil / Community Organisation"
 * label (D1 brief section 25).
 */
export function getOrganisationDisplayLabel(
  category: OrganisationCategory | "",
  profile: OrganisationCategoryProfile | null,
): string {
  if (isTamilSangamProfile(profile)) return "Tamil Sangam";
  return getCategoryLabel(category);
}

/**
 * Displays a stored representative relationship using its full, properly
 * cased label (e.g. "President / Chairperson") rather than the raw enum
 * value, for both the applicant review page and admin review.
 */
export function getRepresentativeRoleLabel(relationship: string): string {
  return (
    representativeRelationships.find((option) => option.value === relationship)
      ?.label ?? relationship.replaceAll("_", " ")
  );
}
