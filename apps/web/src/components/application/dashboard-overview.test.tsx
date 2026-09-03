import { render, screen, waitFor } from "@testing-library/react";
import type {
  EligibleOrganisation,
  EnrollmentPlatformState,
  Organisation,
} from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";

import { DashboardOverview } from "./dashboard-overview";

const routerReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace, push: vi.fn() }),
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

vi.mock("@/features/membership/use-membership-service", () => ({
  useMembershipService: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);
const mockedUseMembershipService = vi.mocked(useMembershipService);

function organisation(overrides: Partial<Organisation> = {}): Organisation {
  return {
    id: "org-1",
    category: "business",
    name: "Acme Education Trust",
    country: "India",
    region: "",
    city: "Chennai",
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
    createdAt: "2026-08-25T00:00:00.000Z",
    updatedAt: "2026-08-25T00:00:00.000Z",
    ...overrides,
  };
}

function platform(overrides: Record<string, unknown> = {}) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: { id: "user-1", fullName: "Nila" },
    availableOrganisations: [],
    state: null as EnrollmentPlatformState | null,
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

function noMembershipService() {
  mockedUseMembershipService.mockReturnValue(null);
}

function membershipService(
  managedOrganisations: readonly EligibleOrganisation[] = [],
) {
  mockedUseMembershipService.mockReturnValue({
    listMyManagedOrganisations: vi.fn().mockResolvedValue(managedOrganisations),
  } as unknown as ReturnType<typeof useMembershipService>);
}

const orgA: EligibleOrganisation = {
  id: "org-1",
  name: "Acme Education Trust",
  category: "education",
  subtype: "",
  city: "Chennai",
  region: "",
  country: "India",
};
const sangamA: EligibleOrganisation = {
  id: "sangam-1",
  name: "Chennai Tamil Sangam",
  category: "tamil_community",
  subtype: "Tamil Sangam",
  city: "Chennai",
  region: "",
  country: "India",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("DashboardOverview", () => {
  it("shows a sign-in prompt for a logged-out visitor", () => {
    platform({ currentUser: null });
    noMembershipService();
    render(<DashboardOverview />);
    expect(
      screen.getByRole("heading", { name: "Sign in to view your dashboard" }),
    ).toBeInTheDocument();
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it("redirects to the Member workspace when the account manages nothing", async () => {
    platform();
    membershipService([]);
    render(<DashboardOverview />);
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith("/workspace/member"),
    );
  });

  it("redirects straight to the single managed Organisation workspace", async () => {
    platform();
    membershipService([orgA]);
    render(<DashboardOverview />);
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(
        "/workspace/organisation?organization=org-1",
      ),
    );
  });

  it("redirects straight to the single managed Tamil Sangam workspace", async () => {
    platform();
    membershipService([sangamA]);
    render(<DashboardOverview />);
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(
        "/workspace/sangam?sangam=sangam-1",
      ),
    );
  });

  it("enters the Member workspace when the account manages more than one, leaving selection to the premium switcher", async () => {
    platform();
    membershipService([orgA, sangamA]);
    render(<DashboardOverview />);
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith("/workspace/member"),
    );
    expect(screen.queryByText("You manage more than one workspace")).toBeNull();
  });

  it("falls back to membership-based classification when the management-grant service is unavailable (mock backend)", async () => {
    const state = {
      registrations: [
        {
          organisationId: "org-1",
          categoryProfile: { category: "business" },
        },
      ],
    } as unknown as EnrollmentPlatformState;
    platform({ availableOrganisations: [organisation()], state });
    noMembershipService();
    render(<DashboardOverview />);
    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith(
        "/workspace/organisation?organization=org-1",
      ),
    );
  });
});
