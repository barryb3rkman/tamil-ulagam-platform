import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { OrganisationApplication } from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useSangamRegistrationService } from "@/features/sangam/use-sangam-registration-service";

import { SangamRegistrationWizard } from "./sangam-registration-wizard";

vi.mock("next/navigation", () => ({
  usePathname: () => "/join/sangam",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

vi.mock("@/features/sangam/use-sangam-registration-service", () => ({
  useSangamRegistrationService: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);
const mockedUseSangamRegistrationService = vi.mocked(
  useSangamRegistrationService,
);

function platform(overrides: Record<string, unknown>) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: null,
    checkDuplicateSignals: vi.fn().mockResolvedValue({
      nameMatch: false,
      emailMatch: false,
      registrationNumberMatch: false,
      matches: [],
    }),
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

function draftApplication(
  overrides: Partial<OrganisationApplication["registration"]> = {},
): OrganisationApplication {
  return {
    organisation: {
      id: "sangam-1",
      category: "tamil_community",
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
      organisationId: "sangam-1",
      applicantUserId: "user-1",
      status: "draft",
      currentStep: 1,
      categoryProfile: {
        category: "tamil_community",
        subtype: "Tamil Sangam",
        primaryActivities: [],
        membershipSize: "",
        geographicAreaServed: "",
        chairpersonName: "",
        secretaryName: "",
        languages: "",
        networkAffiliated: "",
        networkName: "",
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SangamRegistrationWizard auth-aware states", () => {
  it("shows the real logged-out journey (not a bare loading state) when hydrated with no user", () => {
    platform({ isHydrated: true, currentUser: null });
    mockedUseSangamRegistrationService.mockReturnValue(null);

    render(<SangamRegistrationWizard />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Register a Tamil Sangam",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Create account & begin/ }),
    ).toBeInTheDocument();
  });

  it("shows an unavailable message when Supabase isn't configured, even for a signed-in user", () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
    });
    mockedUseSangamRegistrationService.mockReturnValue(null);

    render(<SangamRegistrationWizard />);

    expect(
      screen.getByText(/not configured for this deployment/i),
    ).toBeInTheDocument();
  });

  it("creates/loads the draft via ensureDraft and renders Stage 1 for a signed-in user", async () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
    });
    const ensureDraft = vi.fn().mockResolvedValue(draftApplication());
    mockedUseSangamRegistrationService.mockReturnValue({
      ensureDraft,
    } as unknown as ReturnType<typeof useSangamRegistrationService>);

    render(<SangamRegistrationWizard />);

    await waitFor(() =>
      expect(screen.getByLabelText(/Sangam name/)).toBeInTheDocument(),
    );
    expect(ensureDraft).toHaveBeenCalledTimes(1);
    // No membership-type/subtype selector is ever offered to the Sangam
    // applicant — subtype is fixed server-side.
    expect(screen.queryByText(/subtype/i)).not.toBeInTheDocument();
  });

  it("blocks Continue on Stage 1 until required identity fields are valid", async () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
    });
    const ensureDraft = vi.fn().mockResolvedValue(draftApplication());
    mockedUseSangamRegistrationService.mockReturnValue({
      ensureDraft,
      updateCurrentStep: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useSangamRegistrationService>);

    render(<SangamRegistrationWizard />);

    await waitFor(() =>
      expect(screen.getByLabelText(/Sangam name/)).toBeInTheDocument(),
    );
    screen.getByRole("button", { name: "Continue" }).click();

    await waitFor(() =>
      expect(
        screen.getByText("Enter the organisation name."),
      ).toBeInTheDocument(),
    );
  });

  it("shows the locked status screen (not the editable form) for a submitted application", async () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
    });
    const ensureDraft = vi
      .fn()
      .mockResolvedValue(draftApplication({ status: "submitted" }));
    mockedUseSangamRegistrationService.mockReturnValue({
      ensureDraft,
    } as unknown as ReturnType<typeof useSangamRegistrationService>);

    render(<SangamRegistrationWizard />);

    await waitFor(() =>
      expect(screen.getByText("Registration submitted")).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText("Sangam name")).not.toBeInTheDocument();
  });

  it("keeps a needs_changes application editable, resuming the wizard rather than the status screen", async () => {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
    });
    const ensureDraft = vi.fn().mockResolvedValue(
      draftApplication({
        status: "needs_changes",
        adminFeedback: "Add a description.",
      }),
    );
    mockedUseSangamRegistrationService.mockReturnValue({
      ensureDraft,
    } as unknown as ReturnType<typeof useSangamRegistrationService>);

    render(<SangamRegistrationWizard />);

    await waitFor(() =>
      expect(screen.getByLabelText(/Sangam name/)).toBeInTheDocument(),
    );
  });
});
