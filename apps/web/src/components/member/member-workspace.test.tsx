import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";

import { MemberWorkspace } from "./member-workspace";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/member",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

vi.mock("@/features/membership/use-membership-service", () => ({
  useMembershipService: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);
const mockedUseMembershipService = vi.mocked(useMembershipService);

function platform(overrides: Record<string, unknown>) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: null,
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

function makeMembership(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "membership-1",
    organisationId: "organisation-1",
    userId: "user-1",
    status: "approved",
    membershipType: "",
    requestedAt: "2026-08-25T00:00:00.000Z",
    invitedAt: null,
    invitedBy: null,
    decidedAt: "2026-08-25T01:00:00.000Z",
    decidedBy: "manager-1",
    expiresAt: null,
    createdAt: "2026-08-25T00:00:00.000Z",
    updatedAt: "2026-08-25T01:00:00.000Z",
    ...overrides,
  };
}

const org: EligibleOrganisation = {
  id: "organisation-1",
  name: "Toronto Tamil Sangam",
  category: "tamil_community",
  subtype: "Tamil Sangam",
  city: "Toronto",
  region: "Ontario",
  country: "Canada",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MemberWorkspace auth-aware states", () => {
  it("shows sign-in prompts for a logged-out visitor, not the affiliations list", () => {
    platform({ isHydrated: true, currentUser: null });
    mockedUseMembershipService.mockReturnValue(null);

    render(<MemberWorkspace />);

    expect(
      screen.getByRole("heading", {
        name: /Sign in to view your Member Workspace/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your affiliations" }),
    ).not.toBeInTheDocument();
  });

  it("shows a purposeful empty state when the signed-in user has no affiliations", async () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue({
      listMyMemberships: vi.fn().mockResolvedValue([]),
      listMyAffiliatedOrganisations: vi.fn().mockResolvedValue([]),
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<MemberWorkspace />);

    await waitFor(() =>
      expect(screen.getByText("No affiliations yet")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("link", { name: "Find an organisation" }),
    ).toHaveAttribute("href", "/join/member");
  });

  it("renders approved affiliations before pending ones", async () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue({
      listMyMemberships: vi.fn().mockResolvedValue([
        makeMembership({
          id: "membership-pending",
          status: "pending",
          decidedAt: null,
        }),
        makeMembership({ id: "membership-approved", status: "approved" }),
      ]),
      listMyAffiliatedOrganisations: vi.fn().mockResolvedValue([org]),
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<MemberWorkspace />);

    await waitFor(() =>
      expect(screen.getAllByText("Toronto Tamil Sangam")).toHaveLength(2),
    );
    const statuses = screen.getAllByText(/Approved|Pending review/);
    expect(statuses[0]).toHaveTextContent("Approved");
  });
});
