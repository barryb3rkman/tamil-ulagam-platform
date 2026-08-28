import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
        memberCount: "",
        spocFullName: "",
        spocEmail: "",
        spocPhone: "",
        presidentFullName: "",
        presidentEmail: "",
        presidentPhone: "",
        registrationDocumentPath: "",
        registrationDocumentFilename: "",
        registrationDocumentUploadedAt: "",
        socialLinks: [],
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
      expect(screen.getByText("Enter the Sangam's name.")).toBeInTheDocument(),
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

// Phase H3 (Tamil Sangam registration V2) — new field-model coverage.
describe("SangamRegistrationWizard V2 fields", () => {
  function servicePlatformAndMocks() {
    platform({
      isHydrated: true,
      currentUser: {
        id: "user-1",
        fullName: "Nila",
        email: "nila@example.com",
      },
    });
    const service = {
      ensureDraft: vi.fn(),
      updateOrganisation: vi.fn().mockResolvedValue(undefined),
      updateCategoryProfile: vi.fn().mockResolvedValue(undefined),
      updateRepresentative: vi.fn().mockResolvedValue(undefined),
      updateCurrentStep: vi.fn().mockResolvedValue(undefined),
      uploadRegistrationDocument: vi.fn(),
      removeRegistrationDocument: vi.fn().mockResolvedValue(undefined),
      getRegistrationDocumentSignedUrl: vi.fn(),
    };
    mockedUseSangamRegistrationService.mockReturnValue(
      service as unknown as ReturnType<typeof useSangamRegistrationService>,
    );
    return service;
  }

  it("Stage 1 asks for year of commencement and approximate member count, not a generic description field", async () => {
    const service = servicePlatformAndMocks();
    service.ensureDraft.mockResolvedValue(draftApplication());

    render(<SangamRegistrationWizard />);

    await waitFor(() =>
      expect(screen.getByLabelText(/Sangam name/)).toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/Year of commencement/)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Approximate number of members/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Community served/)).not.toBeInTheDocument();
  });

  it("Stage 2 hides the registration number and document upload when 'No' is selected, and reveals them for 'Yes'", async () => {
    const service = servicePlatformAndMocks();
    service.ensureDraft.mockResolvedValue(
      draftApplication({
        currentStep: 2,
        categoryProfile: {
          ...draftApplication().registration.categoryProfile!,
        },
      }),
    );

    render(<SangamRegistrationWizard />);

    await waitFor(() =>
      expect(
        screen.getByText("Is this Tamil Sangam formally registered?"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByLabelText(/Registration number/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Registration document/)).not.toBeInTheDocument();

    const registrationFieldset = screen
      .getByText("Is this Tamil Sangam formally registered?")
      .closest("fieldset")!;
    fireEvent.click(
      within(registrationFieldset).getByRole("radio", { name: "Yes" }),
    );

    expect(screen.getByLabelText(/Registration number/)).toBeInTheDocument();
    expect(screen.getByText(/Registration document/)).toBeInTheDocument();
  });

  it("Stage 3 collects SPOC and President as two separate named contacts, and 'Same as SPOC' copies SPOC into President", async () => {
    const service = servicePlatformAndMocks();
    service.ensureDraft.mockResolvedValue(draftApplication({ currentStep: 3 }));

    render(<SangamRegistrationWizard />);

    await waitFor(() =>
      expect(
        screen.getByText("Single Point of Contact (SPOC)"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("President")).toBeInTheDocument();
    // No generic "Representative role" selector any more.
    expect(
      screen.queryByLabelText(/Representative role/),
    ).not.toBeInTheDocument();

    const [spocName, presidentName] = screen.getAllByLabelText(/Full name/);
    fireEvent.change(spocName!, { target: { value: "Kavitha Selvam" } });

    fireEvent.click(screen.getByRole("button", { name: "Same as SPOC" }));

    expect(presidentName).toHaveValue("Kavitha Selvam");
  });

  it("Digital presence: 'Add another link' appends a social link input, and its remove control removes it", async () => {
    const service = servicePlatformAndMocks();
    service.ensureDraft.mockResolvedValue(draftApplication({ currentStep: 3 }));

    render(<SangamRegistrationWizard />);

    await waitFor(() =>
      expect(screen.getByText("Digital presence")).toBeInTheDocument(),
    );
    expect(
      screen.queryByLabelText(/Social media link 1/),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "+ Add another link" }));
    expect(screen.getByLabelText("Social media link 1")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove social media link 1" }),
    );
    expect(
      screen.queryByLabelText(/Social media link 1/),
    ).not.toBeInTheDocument();
  });
});
