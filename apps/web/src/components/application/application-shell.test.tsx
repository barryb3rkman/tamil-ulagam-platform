import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Organisation, UserProfile } from "@tamil-ulagam/shared";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { ApplicationShell } from "./application-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
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

function makeOrganisation(overrides: Partial<Organisation> = {}): Organisation {
  return {
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
    ...overrides,
  };
}

/**
 * Builds a full usePlatform() return value. Reused across scenarios so each
 * test only needs to override the authorization-relevant fields — this
 * mirrors the platform-provider authorization result the shell actually
 * consumes, rather than any client-only or spoofable state.
 */
function mockPlatform(overrides: Partial<ReturnType<typeof usePlatform>>) {
  mockedUsePlatform.mockReturnValue({
    backendKind: "supabase",
    canReviewApplications: false,
    isHydrated: true,
    platformError: "",
    captcha: { enabled: false },
    state: null,
    currentUser: makeUser(),
    currentApplication: null,
    applications: [],
    availableOrganisations: [],
    signup: vi.fn(),
    login: vi.fn(),
    requestPasswordReset: vi.fn(),
    resolveAuthCallback: vi.fn(),
    completePasswordRecovery: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    ensureDraft: vi.fn(),
    selectOrganisation: vi.fn(),
    updateOrganisation: vi.fn(),
    updateCategory: vi.fn(),
    updateCategoryProfile: vi.fn(),
    updateRepresentative: vi.fn(),
    updateCurrentStep: vi.fn(),
    submitRegistration: vi.fn(),
    getApplication: vi.fn(),
    loadApplication: vi.fn(),
    updateApplicationStatus: vi.fn(),
    resetDemo: vi.fn(),
    ...overrides,
  } as ReturnType<typeof usePlatform>);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ApplicationShell navigation authorization", () => {
  it("does not show an Administration link for an ordinary member with no review capability", () => {
    mockPlatform({
      canReviewApplications: false,
      availableOrganisations: [makeOrganisation()],
    });

    render(
      <ApplicationShell area="member">
        <div />
      </ApplicationShell>,
    );

    const nav = screen.getByRole("navigation", { name: "Account navigation" });
    expect(
      screen.queryByRole("link", { name: "Administration" }),
    ).not.toBeInTheDocument();
    expect(nav).toBeInTheDocument();
  });

  it("shows the Administration link for a reviewer with no organisation, and no misleading My Organisation link in the admin shell", () => {
    mockPlatform({
      canReviewApplications: true,
      availableOrganisations: [],
    });

    const { unmount } = render(
      <ApplicationShell area="member">
        <div />
      </ApplicationShell>,
    );
    expect(screen.getByRole("link", { name: "Administration" })).toBeVisible();
    unmount();

    render(
      <ApplicationShell area="admin">
        <div />
      </ApplicationShell>,
    );
    expect(
      screen.queryByRole("link", { name: "My Organisation" }),
    ).not.toBeInTheDocument();
  });

  it("shows both Administration (member area) and My Organisation (admin area) for a dual-role user with an organisation", () => {
    mockPlatform({
      canReviewApplications: true,
      availableOrganisations: [makeOrganisation()],
    });

    const { unmount } = render(
      <ApplicationShell area="member">
        <div />
      </ApplicationShell>,
    );
    const memberNav = screen.getByRole("navigation", {
      name: "Account navigation",
    });
    const adminLink = screen.getByRole("link", { name: "Administration" });
    expect(adminLink).toBeVisible();
    expect(adminLink).toHaveAttribute("href", "/admin");
    expect(memberNav).toContainElement(adminLink);
    unmount();

    render(
      <ApplicationShell area="admin">
        <div />
      </ApplicationShell>,
    );
    const adminNav = screen.getByRole("navigation", {
      name: "Admin navigation",
    });
    const returnLink = screen.getByRole("link", { name: "My Organisation" });
    expect(returnLink).toBeVisible();
    expect(returnLink).toHaveAttribute("href", "/dashboard");
    expect(adminNav).toContainElement(returnLink);
  });
});
