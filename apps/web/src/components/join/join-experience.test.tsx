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
  options: { readonly sangam?: boolean; readonly organisationId?: string } = {},
): OrganisationApplication {
  const organisation = {
    id: options.organisationId ?? "org-1",
    category: options.sangam ? "tamil_community" : "business",
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
      id: `reg-${organisation.id}`,
      organisationId: organisation.id,
      applicantUserId: "user-1",
      status,
      currentStep: 1,
      categoryProfile: options.sangam
        ? { category: "tamil_community", subtype: "Tamil Sangam" }
        : null,
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
    myOrganisationApplications: [],
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
      myOrganisationApplications: [makeApplication("draft")],
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
      myOrganisationApplications: [makeApplication("needs_changes")],
    });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Continue your registration" }),
    ).toBeInTheDocument();
  });

  it("shows an Open workspace card for a verified organisation, linking straight there", () => {
    mockPlatform({
      isHydrated: true,
      currentUser: makeUser(),
      myOrganisationApplications: [
        makeApplication("verified", { organisationId: "org-verified" }),
      ],
    });

    render(<JoinExperience />);

    const heading = screen.getByRole("heading", { name: "Open workspace" });
    expect(heading).toBeInTheDocument();
    expect(heading.closest("a")).toHaveAttribute(
      "href",
      "/workspace/organisation?organization=org-verified",
    );
  });

  it("does not resume for a non-editable, non-verified application status (e.g. rejected)", () => {
    mockPlatform({
      isHydrated: true,
      currentUser: makeUser(),
      myOrganisationApplications: [makeApplication("rejected")],
    });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Register an Organisation" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Continue your registration" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Open workspace" }),
    ).not.toBeInTheDocument();
  });

  it("does not resume before platform state is hydrated, even with a stale application in memory", () => {
    mockPlatform({
      isHydrated: false,
      currentUser: makeUser(),
      myOrganisationApplications: [makeApplication("draft")],
    });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Register an Organisation" }),
    ).toBeInTheDocument();
  });

  it("personalizes the Sangam card independently of the Organisation card", () => {
    mockPlatform({
      isHydrated: true,
      currentUser: makeUser(),
      myOrganisationApplications: [
        makeApplication("draft", { organisationId: "org-1" }),
        makeApplication("verified", {
          sangam: true,
          organisationId: "sangam-1",
        }),
      ],
    });

    render(<JoinExperience />);

    expect(
      screen.getByRole("heading", { name: "Continue your registration" }),
    ).toBeInTheDocument();
    const openWorkspace = screen.getByRole("heading", {
      name: "Open workspace",
    });
    expect(openWorkspace.closest("a")).toHaveAttribute(
      "href",
      "/workspace/sangam?sangam=sangam-1",
    );
  });

  it("never shows an admin-console banner — Federation Admin access lives in the authenticated header only", () => {
    mockPlatform({ isHydrated: true, canReviewApplications: true });

    render(<JoinExperience />);

    expect(
      screen.queryByRole("link", { name: /admin console/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Reviewing applications\?/i),
    ).not.toBeInTheDocument();
  });
});
