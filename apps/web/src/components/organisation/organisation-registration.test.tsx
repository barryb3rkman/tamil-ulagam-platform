import { render, screen, waitFor } from "@testing-library/react";
import type { OrganisationApplication } from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { OrganisationRegistration } from "./organisation-registration";

vi.mock("next/navigation", () => ({
  usePathname: () => "/join/organisation",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);

function draftApplication(
  overrides: Partial<OrganisationApplication["registration"]> = {},
): OrganisationApplication {
  return {
    organisation: {
      id: "org-1",
      category: "business",
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
      createdAt: "2026-08-26T00:00:00.000Z",
      updatedAt: "2026-08-26T00:00:00.000Z",
    },
    registration: {
      id: "application-1",
      organisationId: "org-1",
      applicantUserId: "user-1",
      status: "draft",
      currentStep: 1,
      categoryProfile: {
        category: "business",
        businessType: "",
        industry: "",
        productsServices: "",
        employeeSize: "",
        operatingCountries: "",
      },
      representative: {
        fullName: "",
        email: "nila@example.com",
        phone: "",
        designation: "",
        relationship: "",
        authorisedDeclaration: false,
        accuracyDeclaration: false,
      },
      adminFeedback: "",
      submittedAt: "",
      reviewedAt: "",
      reviewedBy: "",
      createdAt: "2026-08-26T00:00:00.000Z",
      updatedAt: "2026-08-26T00:00:00.000Z",
      ...overrides,
    },
    representativeUser: {
      id: "user-1",
      fullName: "Nila",
      email: "nila@example.com",
      phone: "",
      country: "",
      termsAcceptedAt: null,
      createdAt: "2026-08-26T00:00:00.000Z",
    },
  };
}

function platform(overrides: Record<string, unknown>) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: null,
    platformError: "",
    currentApplication: null,
    ensureDraft: vi.fn().mockResolvedValue(draftApplication()),
    checkDuplicateSignals: vi.fn().mockResolvedValue({
      nameMatch: false,
      emailMatch: false,
      registrationNumberMatch: false,
      matches: [],
    }),
    updateCategory: vi.fn(),
    updateOrganisation: vi.fn(),
    updateCategoryProfile: vi.fn(),
    updateRepresentative: vi.fn(),
    updateCurrentStep: vi.fn(),
    submitRegistration: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("OrganisationRegistration auth-aware states", () => {
  it("shows the real logged-out journey when hydrated with no user", () => {
    platform({ isHydrated: true, currentUser: null });

    render(<OrganisationRegistration />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Register an Organisation",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Create account & begin/ }),
    ).toBeInTheDocument();
  });

  it("shows an unavailable message when the platform is unconfigured, even for a signed-in user", () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
      platformError:
        "Organisation enrollment is not configured for this deployment.",
    });

    render(<OrganisationRegistration />);

    expect(
      screen.getByText(/not configured for this deployment/i),
    ).toBeInTheDocument();
  });

  it("loads the draft via ensureDraft and renders Stage 1 for a signed-in user with no application yet", async () => {
    const ensureDraft = vi.fn().mockResolvedValue(draftApplication());
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
      currentApplication: null,
      ensureDraft,
    });

    render(<OrganisationRegistration />);

    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));
  });

  it("renders Stage 1 fields once a draft application is present", () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
      currentApplication: draftApplication(),
    });

    render(<OrganisationRegistration />);

    expect(screen.getByLabelText(/Organisation name/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Register your organisation",
      }),
    ).toBeInTheDocument();
  });

  it("blocks Continue on Stage 1 until a category and required identity fields are valid", async () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
      currentApplication: draftApplication(),
    });

    render(<OrganisationRegistration />);
    screen.getByRole("button", { name: "Continue" }).click();

    expect(
      await screen.findByText("Enter the organisation name."),
    ).toBeInTheDocument();
  });

  it("shows guidance toward Tamil Sangam registration when the community category is selected", () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
      currentApplication: draftApplication(),
    });

    render(<OrganisationRegistration />);
    screen.getByLabelText(/Tamil \/ Community Organisation/).click();

    expect(
      screen.getByRole("link", { name: "Go to Tamil Sangam registration" }),
    ).toHaveAttribute("href", "/join/sangam");
  });

  it("shows the locked status screen (not the editable form) for a submitted application", () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
      currentApplication: draftApplication({ status: "submitted" }),
    });

    render(<OrganisationRegistration />);

    expect(screen.getByText("Registration submitted")).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Organisation name/),
    ).not.toBeInTheDocument();
  });

  it("keeps a needs_changes application editable, resuming the wizard rather than the status screen", () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
      currentApplication: draftApplication({
        status: "needs_changes",
        adminFeedback: "Add a description.",
      }),
    });

    render(<OrganisationRegistration />);

    expect(screen.getByLabelText(/Organisation name/)).toBeInTheDocument();
  });
});
