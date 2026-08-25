import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useMembershipService } from "@/features/membership/use-membership-service";

import { MemberRegistration } from "./member-registration";

vi.mock("next/navigation", () => ({
  usePathname: () => "/join/member",
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

describe("MemberRegistration auth-aware states", () => {
  it("shows a loading state before hydration resolves, not the logged-out or directory content", () => {
    platform({ isHydrated: false, currentUser: null });
    mockedUseMembershipService.mockReturnValue(null);

    render(<MemberRegistration />);

    expect(
      screen.getByRole("status", { name: /loading organisations/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Join as a Member" }),
    ).not.toBeInTheDocument();
  });

  it("shows the real logged-out journey once hydrated with no user", () => {
    platform({ isHydrated: true, currentUser: null });
    mockedUseMembershipService.mockReturnValue(null);

    render(<MemberRegistration />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Join as a Member" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("shows an unavailable message when Supabase isn't configured, even for a signed-in user", () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue(null);

    render(<MemberRegistration />);

    expect(
      screen.getByText(/not configured for this deployment/i),
    ).toBeInTheDocument();
  });

  it("loads and renders the eligible-organisation directory for a signed-in user", async () => {
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue({
      listEligibleOrganisations: vi.fn().mockResolvedValue([org]),
      listMyMemberships: vi.fn().mockResolvedValue([]),
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<MemberRegistration />);

    await waitFor(() =>
      expect(screen.getByText("Toronto Tamil Sangam")).toBeInTheDocument(),
    );
    expect(screen.getByText("1 verified organisation")).toBeInTheDocument();
  });

  it("shows a retry action when the directory fails to load", async () => {
    const listEligibleOrganisations = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce([org]);
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue({
      listEligibleOrganisations,
      listMyMemberships: vi.fn().mockResolvedValue([]),
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<MemberRegistration />);

    await waitFor(() =>
      expect(screen.getByText("network down")).toBeInTheDocument(),
    );
    screen.getByRole("button", { name: "Try again" }).click();

    await waitFor(() =>
      expect(screen.getByText("Toronto Tamil Sangam")).toBeInTheDocument(),
    );
    expect(listEligibleOrganisations).toHaveBeenCalledTimes(2);
  });

  it("goes from selecting an organisation to a confirm screen, then to a success state on request", async () => {
    const requestMembership = vi.fn().mockResolvedValue({
      id: "membership-1",
      organisationId: org.id,
      userId: "user-1",
      status: "pending",
      membershipType: "",
      requestedAt: new Date().toISOString(),
      invitedAt: null,
      invitedBy: null,
      decidedAt: null,
      decidedBy: null,
      expiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies Membership);
    platform({
      isHydrated: true,
      currentUser: { id: "user-1", fullName: "Nila" },
    });
    mockedUseMembershipService.mockReturnValue({
      listEligibleOrganisations: vi.fn().mockResolvedValue([org]),
      listMyMemberships: vi.fn().mockResolvedValue([]),
      requestMembership,
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<MemberRegistration />);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Choose organisation" }),
      ).toBeInTheDocument(),
    );
    screen.getByRole("button", { name: "Choose organisation" }).click();

    await waitFor(() =>
      expect(
        screen.getByText(/You.?re requesting to join Toronto Tamil Sangam\./),
      ).toBeInTheDocument(),
    );
    // No membership-type selector is offered at this stage.
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    screen.getByRole("button", { name: "Request membership" }).click();

    await waitFor(() =>
      expect(screen.getByText("Request sent")).toBeInTheDocument(),
    );
    expect(requestMembership).toHaveBeenCalledWith(org.id);
  });
});
