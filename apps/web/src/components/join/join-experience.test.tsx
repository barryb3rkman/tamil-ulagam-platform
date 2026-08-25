import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  Organisation,
  OrganisationApplication,
  UserProfile,
} from "@tamil-ulagam/shared";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { JoinExperience } from "./join-experience";

vi.mock("next/navigation", () => ({
  usePathname: () => "/join",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);

function makeUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "user-1",
    fullName: "Test Person",
    email: "test@example.org",
    phone: "",
    country: "",
    termsAcceptedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeApplication(
  status: OrganisationApplication["registration"]["status"],
): OrganisationApplication {
  const organisation = {
    id: "org-1",
    category: "business",
    name: "Test Org",
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Organisation;

  return {
    organisation,
    representativeUser: makeUser(),
    registration: {
      id: "reg-1",
      organisationId: organisation.id,
      applicantUserId: "user-1",
      status,
      currentStep: 1,
      categoryProfile: null,
      representative: {},
      adminFeedback: "",
      submittedAt: "",
      reviewedAt: "",
      reviewedBy: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  } as OrganisationApplication;
}

function mockPlatform(overrides: Partial<ReturnType<typeof usePlatform>>) {
  mockedUsePlatform.mockReturnValue({
    backendKind: "supabase",
    canReviewApplications: false,
    isHydrated: true,
    platformError: "",
    captcha: { enabled: false },
    state: null,
    currentUser: null,
    currentApplication: null,
    applications: [],
    availableOrganisations: [],
    ...overrides,
  } as ReturnType<typeof usePlatform>);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("JoinExperience auth-aware behavior", () => {
  it("shows the default Organisation copy for a logged-out visitor", () => {
    mockPlatform({ isHydrated: true, currentUser: null });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Register an Organisation" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Continue your registration" }),
    ).not.toBeInTheDocument();
  });

  it("swaps the Organisation card to resume copy for an applicant with a draft application", () => {
    mockPlatform({
      isHydrated: true,
      currentUser: makeUser(),
      currentApplication: makeApplication("draft"),
    });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Continue your registration" }),
    ).toBeInTheDocument();
  });

  it("also resumes for a needs_changes application", () => {
    mockPlatform({
      isHydrated: true,
      currentUser: makeUser(),
      currentApplication: makeApplication("needs_changes"),
    });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Continue your registration" }),
    ).toBeInTheDocument();
  });

  it("does not resume for a non-editable application status (e.g. submitted)", () => {
    mockPlatform({
      isHydrated: true,
      currentUser: makeUser(),
      currentApplication: makeApplication("submitted"),
    });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Register an Organisation" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Continue your registration" }),
    ).not.toBeInTheDocument();
  });

  it("does not resume before platform state is hydrated, even with a stale application in memory", () => {
    mockPlatform({
      isHydrated: false,
      currentUser: makeUser(),
      currentApplication: makeApplication("draft"),
    });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Register an Organisation" }),
    ).toBeInTheDocument();
  });

  it("shows a visible, non-redirecting affordance to the admin console for a reviewer", () => {
    mockPlatform({ isHydrated: true, canReviewApplications: true });

    render(<JoinExperience />);

    expect(
      screen.getByRole("link", { name: /Open admin console/ }),
    ).toHaveAttribute("href", "/admin");
    // Still on /join — this is an affordance, not an automatic redirect.
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("does not show the reviewer affordance for an ordinary member", () => {
    mockPlatform({ isHydrated: true, canReviewApplications: false });

    render(<JoinExperience />);

    expect(
      screen.queryByRole("link", { name: /Open admin console/ }),
    ).not.toBeInTheDocument();
  });
});
