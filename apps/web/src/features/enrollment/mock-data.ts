import type {
  MockPlatformState,
  Organisation,
  OrganisationCategory,
  OrganisationCategoryProfile,
  OrganisationRegistration,
  OrganisationRepresentative,
  BusinessProfile,
  EducationProfile,
  HealthcareProfile,
  NonprofitProfile,
  OtherOrganisationProfile,
  RegistrationStatus,
  TamilCommunityProfile,
  UserProfile,
} from "@tamil-ulagam/shared";

const seededAt = "2026-08-01T09:00:00.000Z";

export const demoCredentials = {
  email: "arun.kumar@example.org",
  password: "TamilUlagam1!",
} as const;

export function createDemoUser(): UserProfile {
  return {
    id: "user-demo",
    fullName: "Arun Kumar",
    email: demoCredentials.email,
    phone: "+1 416 555 0142",
    country: "Canada",
    termsAcceptedAt: seededAt,
    createdAt: seededAt,
  };
}

export function createEmptyRepresentative(
  user?: UserProfile,
): OrganisationRepresentative {
  return {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    designation: "",
    relationship: "",
    authorisedDeclaration: false,
    accuracyDeclaration: false,
  };
}

export function createEmptyCategoryProfile(
  category: "tamil_community",
): TamilCommunityProfile;
export function createEmptyCategoryProfile(
  category: "education",
): EducationProfile;
export function createEmptyCategoryProfile(
  category: "healthcare",
): HealthcareProfile;
export function createEmptyCategoryProfile(
  category: "business",
): BusinessProfile;
export function createEmptyCategoryProfile(
  category: "nonprofit",
): NonprofitProfile;
export function createEmptyCategoryProfile(
  category: "other",
): OtherOrganisationProfile;
export function createEmptyCategoryProfile(
  category: OrganisationCategory,
): OrganisationCategoryProfile;
export function createEmptyCategoryProfile(
  category: OrganisationCategory,
): OrganisationCategoryProfile {
  switch (category) {
    case "tamil_community":
      return {
        category,
        subtype: "",
        primaryActivities: [],
        membershipSize: "",
        geographicAreaServed: "",
        chairpersonName: "",
        secretaryName: "",
        languages: "",
      };
    case "education":
      return {
        category,
        institutionType: "",
        governanceType: "",
        tamilProgrammesOffered: "",
        tamilProgrammesDescription: "",
        accreditationAuthority: "",
        accreditationNumber: "",
        studentPopulation: "",
        studyAreas: [],
      };
    case "healthcare":
      return {
        category,
        facilityType: "",
        ownershipType: "",
        systemsOfMedicine: [],
        mainServices: "",
        licensed: "",
        licenceNumber: "",
        licensingAuthority: "",
        twentyFourSeven: false,
        emergencyServices: false,
        numberOfBeds: "",
      };
    case "business":
      return {
        category,
        businessType: "",
        industry: "",
        productsServices: "",
        employeeSize: "",
        operatingCountries: "",
      };
    case "nonprofit":
      return {
        category,
        subtype: "",
        primaryAreas: [],
        beneficiaryRegions: "",
        organisationSize: "",
      };
    case "other":
      return {
        category,
        organisationType: "",
        primaryPurpose: "",
      };
  }
}

export function createEmptyOrganisation(id: string, now: string): Organisation {
  return {
    id,
    category: "",
    name: "",
    country: "",
    region: "",
    city: "",
    streetAddress: "",
    postalCode: "",
    officialEmail: "",
    officialPhone: "",
    website: "",
    yearEstablished: "",
    description: "",
    registrationStatus: "",
    registrationNumber: "",
    registrationAuthority: "",
    registrationCountry: "",
    logoPreview: "",
    officialEmailVerifiedAt: null,
    officialEmailVerificationSentAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function seedApplication(
  id: string,
  user: UserProfile,
  organisation: Organisation,
  status: RegistrationStatus,
  categoryProfile: OrganisationCategoryProfile,
  feedback = "",
): OrganisationRegistration {
  return {
    id,
    organisationId: organisation.id,
    applicantUserId: user.id,
    status,
    currentStep: 4,
    categoryProfile,
    representative: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      designation: "Authorised representative",
      relationship: "authorised_representative",
      authorisedDeclaration: true,
      accuracyDeclaration: true,
    },
    adminFeedback: feedback,
    submittedAt: "2026-08-12T10:30:00.000Z",
    reviewedAt: status === "submitted" ? "" : "2026-08-14T08:15:00.000Z",
    reviewedBy: status === "submitted" ? "" : "Tamil Ulagam review team",
    createdAt: seededAt,
    updatedAt: "2026-08-14T08:15:00.000Z",
  };
}

export function createSeedState(): MockPlatformState {
  const users: UserProfile[] = [
    createDemoUser(),
    ...[
      "Meena Sivarajah",
      "Dr Kavitha Raman",
      "Rajan Selvam",
      "Anjali Nadar",
    ].map((fullName, index) => ({
      id: `user-seed-${index + 2}`,
      fullName,
      email: `representative${index + 2}@example.org`,
      phone: `+1 416 555 01${50 + index}`,
      country: index === 1 ? "United Kingdom" : "Canada",
      termsAcceptedAt: seededAt,
      createdAt: seededAt,
    })),
  ];

  const organisations: Organisation[] = [
    {
      ...createEmptyOrganisation("organisation-toronto", seededAt),
      category: "tamil_community",
      name: "Toronto Tamil Sangam",
      country: "Canada",
      region: "Ontario",
      city: "Toronto",
      streetAddress: "Community Avenue",
      officialEmail: "office@torontotamilsangam.example",
      officialPhone: "+1 416 555 0120",
      description:
        "A Tamil community organisation serving families across the Greater Toronto Area.",
      registrationStatus: "registered",
      registrationNumber: "CA-TS-2048",
      registrationAuthority: "Provincial registry",
      registrationCountry: "Canada",
    },
    {
      ...createEmptyOrganisation("organisation-learning", seededAt),
      category: "education",
      name: "Global Tamil Learning Institute",
      country: "United Kingdom",
      region: "Greater London",
      city: "London",
      streetAddress: "Learning Square",
      officialEmail: "hello@globaltamillearning.example",
      officialPhone: "+44 20 7946 0150",
      description:
        "An education institute focused on language learning and cultural knowledge.",
      registrationStatus: "registered",
      registrationNumber: "UK-GTL-119",
      registrationAuthority: "Education registry",
      registrationCountry: "United Kingdom",
    },
    {
      ...createEmptyOrganisation("organisation-anbu", seededAt),
      category: "healthcare",
      name: "Anbu Medical Centre",
      country: "Canada",
      region: "Ontario",
      city: "Scarborough",
      streetAddress: "Wellbeing Road",
      officialEmail: "admin@anbumedical.example",
      officialPhone: "+1 416 555 0165",
      description:
        "A community medical centre providing primary and allied health services.",
      registrationStatus: "registered",
      registrationNumber: "",
      registrationAuthority: "Ontario health registry",
      registrationCountry: "Canada",
    },
    {
      ...createEmptyOrganisation("organisation-enterprise", seededAt),
      category: "business",
      name: "Tamil Enterprise Network",
      country: "Singapore",
      region: "Central Region",
      city: "Singapore",
      streetAddress: "Enterprise Link",
      officialEmail: "connect@tamilenterprise.example",
      officialPhone: "+65 6123 4567",
      description:
        "A professional network connecting Tamil entrepreneurs and enterprises.",
      registrationStatus: "informal",
    },
    {
      ...createEmptyOrganisation("organisation-foundation", seededAt),
      category: "nonprofit",
      name: "Tamil Community Foundation",
      country: "Australia",
      region: "Victoria",
      city: "Melbourne",
      streetAddress: "Community Place",
      officialEmail: "office@tamilcommunityfoundation.example",
      officialPhone: "+61 3 9000 1234",
      description:
        "A non-profit organisation supporting community development and cultural preservation.",
      registrationStatus: "registered",
      registrationNumber: "AU-TCF-882",
      registrationAuthority: "Australian charities registry",
      registrationCountry: "Australia",
    },
  ];

  const profiles: OrganisationCategoryProfile[] = [
    {
      ...createEmptyCategoryProfile("tamil_community"),
      category: "tamil_community",
      subtype: "Tamil Sangam",
      primaryActivities: ["Cultural programmes", "Tamil language education"],
      membershipSize: "501–1,000",
      geographicAreaServed: "Greater Toronto Area",
    },
    {
      ...createEmptyCategoryProfile("education"),
      category: "education",
      institutionType: "Tamil Language Institute",
      governanceType: "Non-profit",
      tamilProgrammesOffered: "yes",
      tamilProgrammesDescription:
        "Tamil language and cultural learning programmes.",
      studyAreas: ["Tamil Studies", "Arts & Humanities"],
    },
    {
      ...createEmptyCategoryProfile("healthcare"),
      category: "healthcare",
      facilityType: "Medical Centre",
      ownershipType: "Private",
      systemsOfMedicine: ["Modern Medicine", "Physiotherapy"],
      mainServices: "Primary care and allied health services.",
      licensed: "yes",
    },
    {
      ...createEmptyCategoryProfile("business"),
      category: "business",
      businessType: "Non-profit Association",
      industry: "Professional Services",
      productsServices: "Professional networking and enterprise connections.",
      employeeSize: "2–10",
      operatingCountries: "Singapore, Malaysia",
    },
    {
      ...createEmptyCategoryProfile("nonprofit"),
      category: "nonprofit",
      subtype: "Foundation",
      primaryAreas: ["Community development", "Cultural preservation"],
      beneficiaryRegions: "Victoria",
      organisationSize: "11–50",
    },
  ];

  const statuses: RegistrationStatus[] = [
    "under_review",
    "verified",
    "needs_changes",
    "submitted",
    "verified",
  ];

  const registrations = organisations.map((organisation, index) =>
    seedApplication(
      `registration-${organisation.id.replace("organisation-", "")}`,
      users[index] as UserProfile,
      organisation,
      statuses[index] as RegistrationStatus,
      profiles[index] as OrganisationCategoryProfile,
      index === 2
        ? "Please add the facility licence number and confirm the official email address."
        : "",
    ),
  );

  return {
    version: 1,
    currentUserId: null,
    users,
    organisations,
    memberships: organisations.map((organisation, index) => ({
      id: `membership-${index + 1}`,
      userId: (users[index] as UserProfile).id,
      organisationId: organisation.id,
      role: "representative" as const,
      isPrimary: true,
      createdAt: seededAt,
    })),
    registrations,
  };
}
