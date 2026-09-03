import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type {
  EligibleOrganisation,
  OrganisationApplication,
} from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";
import { useSangamRegistrationService } from "@/features/sangam/use-sangam-registration-service";

import { SangamWorkspace } from "./sangam-workspace";

let searchParamValue = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/sangam",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === "sangam" ? searchParamValue || null : null),
  }),
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

vi.mock("@/features/membership/use-membership-service", () => ({
  useMembershipService: vi.fn(),
}));

vi.mock("@/features/sangam/use-sangam-registration-service", () => ({
  useSangamRegistrationService: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);
const mockedUseMembershipService = vi.mocked(useMembershipService);
const mockedUseSangamRegistrationService = vi.mocked(
  useSangamRegistrationService,
);

function platform(overrides: Record<string, unknown>) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: null,
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

const sangam: EligibleOrganisation = {
  id: "sangam-1",
  name: "Riverside Tamil Sangam",
  category: "tamil_community",
  subtype: "Tamil Sangam",
  city: "Ottawa",
  region: "Ontario",
  country: "Canada",
};

function sangamApplication(
  status: OrganisationApplication["registration"]["status"] = "verified",
): OrganisationApplication {
  return {
    organisation: {
      id: sangam.id,
      category: "tamil_community",
      name: sangam.name,
      country: "Canada",
      region: "Ontario",
      city: "Ottawa",
      streetAddress: "",
      postalCode: "",
      officialEmail: "info@riverside-sangam.example",
      officialPhone: "+1 613 555 0100",
      website: "",
      yearEstablished: "",
      description: "",
      registrationStatus: "informal",
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
      organisationId: sangam.id,
      applicantUserId: "user-1",
      status,
      currentStep: 4,
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
        fullName: "Nila",
        email: "nila@example.com",
        phone: "",
        designation: "",
        relationship: "president",
        authorisedDeclaration: true,
        accuracyDeclaration: true,
      },
      adminFeedback: "",
      submittedAt: "2026-08-25T00:00:00.000Z",
      reviewedAt: "2026-08-25T12:00:00.000Z",
      reviewedBy: "Tamil Ulagam review team",
      createdAt: "2026-08-25T00:00:00.000Z",
      updatedAt: "2026-08-25T12:00:00.000Z",
    },
    representativeUser: {
      id: "user-1",
      fullName: "Nila",
      email: "nila@example.com",
      phone: "",
      country: "",
      termsAcceptedAt: null,
      createdAt: "2026-08-25T00:00:00.000Z",
    },
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  searchParamValue = "";
});

describe("SangamWorkspace", () => {
  it("shows a sign-in prompt for a logged-out visitor", () => {
    platform({ isHydrated: true, currentUser: null });
    mockedUseMembershipService.mockReturnValue(null);
    mockedUseSangamRegistrationService.mockReturnValue(null);

    render(<SangamWorkspace />);

    expect(
      screen.getByRole("heading", {
        name: /Sign in to view your Sangam workspace/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows a purposeful empty state when the signed-in user manages no Sangam", async () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([]),
    } as unknown as ReturnType<typeof useMembershipService>);
    mockedUseSangamRegistrationService.mockReturnValue(
      {} as unknown as ReturnType<typeof useSangamRegistrationService>,
    );

    render(<SangamWorkspace />);

    await waitFor(() =>
      expect(
        screen.getByText("You don't manage a Tamil Sangam yet"),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: "Register a Tamil Sangam" }),
    ).toHaveAttribute("href", "/join/sangam");
  });

  it("loads and renders identity, status and verification signals for a single managed Sangam", async () => {
    searchParamValue = sangam.id;
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([sangam]),
      listOrganisationMembershipRequests: vi.fn().mockResolvedValue([]),
      listOrganisationManagers: vi.fn().mockResolvedValue([]),
    } as unknown as ReturnType<typeof useMembershipService>);
    mockedUseSangamRegistrationService.mockReturnValue({
      findByOrganisation: vi
        .fn()
        .mockResolvedValue(sangamApplication("verified")),
    } as unknown as ReturnType<typeof useSangamRegistrationService>);

    render(<SangamWorkspace />);

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Riverside Tamil Sangam" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { name: "Federation status" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Organisation email")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open people management" }),
    ).toHaveAttribute(
      "href",
      `/workspace/organisation/people?organization=${sangam.id}`,
    );
  });

  it("shows a picker when the account manages more than one Sangam", async () => {
    const second = { ...sangam, id: "sangam-2", name: "Harbour Tamil Sangam" };
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([sangam, second]),
    } as unknown as ReturnType<typeof useMembershipService>);
    mockedUseSangamRegistrationService.mockReturnValue(
      {} as unknown as ReturnType<typeof useSangamRegistrationService>,
    );

    render(<SangamWorkspace />);

    await waitFor(() =>
      expect(screen.getByText("Choose a Sangam")).toBeInTheDocument(),
    );
    expect(screen.getByText("Riverside Tamil Sangam")).toBeInTheDocument();
    expect(screen.getByText("Harbour Tamil Sangam")).toBeInTheDocument();
  });
});
