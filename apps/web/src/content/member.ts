import type {
  CategoryConnectionQuestion,
  OrganisationCategory,
} from "@tamil-ulagam/shared";

export const memberLoggedOutContent = {
  eyebrow: "MEMBERSHIP",
  title: "Connect your membership",
  description:
    "If you already belong to a registered Tamil Sangam or Organisation, connect that affiliation to your Tamil Ulagam account.",
  steps: [
    {
      title: "Find your Tamil Sangam or Organisation",
      description: "Search the directory of verified entities.",
    },
    {
      title: "Submit an affiliation claim",
      description: "Tell us where you already belong — in one short step.",
    },
    {
      title: "They confirm your affiliation",
      description:
        "A manager checks that you're genuinely one of their members.",
    },
    {
      title: "Your affiliation becomes active",
      description: "Once confirmed, it appears in your Member Workspace.",
    },
  ],
} as const;

export const memberProfileContent = {
  title: "Your details",
  description: "A few details so the organisation knows who's affiliating.",
} as const;

export const memberAffiliationTypeContent = {
  title: "Where are you already a member?",
  description: "Choose the kind of entity you already belong to.",
  options: [
    {
      value: "sangam",
      title: "Tamil Sangam",
      description: "A Tamil Sangam you're already part of.",
    },
    {
      value: "organisation",
      title: "Organisation",
      description:
        "A business, education, healthcare, non-profit or other organisation.",
    },
  ],
} as const;

export const memberDirectoryContent = {
  sangamTitle: "Find your Tamil Sangam",
  sangamDescription:
    "Search by name, city, region or country. Only verified Sangams appear here.",
  organisationTitle: "Find your Organisation",
  organisationDescription:
    "Filter by category, then search by name, city, region or country. Only verified organisations appear here.",
  searchPlaceholder: "Search by name, city, region or country…",
  searchLabel: "Search",
  categoryLabel: "Category",
  allCategories: "All categories",
  emptyTitle: "No matching organisation found",
  emptyDescription: "Check the spelling or location.",
  noneVerifiedTitle: "None verified yet",
  noneVerifiedDescription:
    "No entity of this kind has completed verification yet. Check back soon.",
  cantFindTitle: "Can't find your organisation?",
  cantFindDescription:
    "It may not be registered with Tamil Ulagam yet. A Tamil Sangam or Organisation registers itself — a member can't create one from here.",
} as const;

export const memberConfirmContent = {
  title: "Confirm your affiliation",
  disclaimer:
    "Your Tamil Ulagam account will be connected after the selected organisation confirms that you are a member. This does not grant organisation-management access.",
  submitCta: "Submit affiliation",
} as const;

export const memberSuccessContent = {
  eyebrow: "AFFILIATION SUBMITTED",
  title: "Affiliation submitted",
  body: "will confirm your membership. You'll see the affiliation in your Member Workspace once it is confirmed.",
  primaryCta: "Open Member Workspace",
  secondaryCta: "Add another affiliation",
} as const;

export const categoryConnectionQuestions: Readonly<
  Record<OrganisationCategory, CategoryConnectionQuestion | null>
> = {
  tamil_community: {
    prompt: "Your involvement",
    options: [
      { value: "Community member", label: "Community member" },
      { value: "Volunteer", label: "Volunteer" },
      { value: "Staff", label: "Staff" },
      { value: "Other", label: "Other" },
    ],
  },
  education: {
    prompt: "Your connection to this organisation",
    options: [
      { value: "Student", label: "Student" },
      { value: "Educator", label: "Educator" },
      { value: "Parent / Guardian", label: "Parent / Guardian" },
      { value: "Alumni", label: "Alumni" },
      { value: "Staff", label: "Staff" },
      { value: "Other", label: "Other" },
    ],
    contextLabel: "Course / field of study",
  },
  healthcare: {
    prompt: "Your connection to this organisation",
    options: [
      { value: "Healthcare professional", label: "Healthcare professional" },
      { value: "Staff", label: "Staff" },
      { value: "Volunteer", label: "Volunteer" },
      { value: "Community member", label: "Community member" },
      { value: "Other", label: "Other" },
    ],
    contextLabel: "Profession / speciality",
    contextOnlyForOptions: ["Healthcare professional"],
  },
  business: {
    prompt: "Your professional role",
    options: [
      { value: "Business owner / Founder", label: "Business owner / Founder" },
      { value: "Entrepreneur", label: "Entrepreneur" },
      { value: "Professional / Employee", label: "Professional / Employee" },
      { value: "Student", label: "Student" },
      { value: "Other", label: "Other" },
    ],
    contextLabel: "Company / Organisation",
    extraLabel: "Industry",
  },
  nonprofit: {
    prompt: "How are you involved?",
    options: [
      { value: "Community member", label: "Community member" },
      { value: "Volunteer", label: "Volunteer" },
      { value: "Staff", label: "Staff" },
      { value: "Supporter", label: "Supporter" },
      { value: "Other", label: "Other" },
    ],
  },
  other: null,
} as const;

export const sangamConnectionQuestion: CategoryConnectionQuestion | null = null;
