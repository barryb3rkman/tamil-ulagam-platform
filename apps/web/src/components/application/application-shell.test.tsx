import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Organisation, UserProfile } from "@tamil-ulagam/shared";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { ApplicationShell } from "./application-shell";

let pathname = "/dashboard/registration";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/workspace/workspace-shell", () => ({
  WorkspaceShell: ({ children }: { readonly children: ReactNode }) => (
    <div data-testid="premium-workspace-shell">{children}</div>
  ),
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
  pathname = "/dashboard/registration";
});

describe("ApplicationShell navigation authorization", () => {
  it("uses the premium workspace shell for the dashboard transition route", () => {
    pathname = "/dashboard";
    mockPlatform({ availableOrganisations: [makeOrganisation()] });

    render(
      <ApplicationShell area="member">
        <div>Transitioning</div>
      </ApplicationShell>,
    );

    expect(screen.getByTestId("premium-workspace-shell")).toBeVisible();
    expect(
      screen.queryByRole("navigation", { name: "Account navigation" }),
    ).not.toBeInTheDocument();
  });

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
