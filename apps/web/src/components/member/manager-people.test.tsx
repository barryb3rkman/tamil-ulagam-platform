import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type {
  EligibleOrganisation,
  MembershipRequestSummary,
} from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useManagementService } from "@/features/management/use-management-service";
import { useMembershipService } from "@/features/membership/use-membership-service";

import { ManagerPeople } from "./manager-people";

const push = vi.fn();
const replace = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/organisation/people",
  useRouter: () => ({ push, replace }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

vi.mock("@/features/membership/use-membership-service", () => ({
  useMembershipService: vi.fn(),
}));

vi.mock("@/features/management/use-management-service", () => ({
  useManagementService: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);
const mockedUseMembershipService = vi.mocked(useMembershipService);
const mockedUseManagementService = vi.mocked(useManagementService);

function platform(overrides: Partial<ReturnType<typeof usePlatform>>) {
  mockedUsePlatform.mockReturnValue({
    isHydrated: true,
    currentUser: { id: "manager-1", fullName: "Manager" },
    ...overrides,
  } as unknown as ReturnType<typeof usePlatform>);
}

const orgA: EligibleOrganisation = {
  id: "org-a",
  name: "Organisation A",
  category: "business",
  subtype: "",
  city: "Toronto",
  region: "Ontario",
  country: "Canada",
};
const orgB: EligibleOrganisation = {
  id: "org-b",
  name: "Organisation B",
  category: "other",
  subtype: "",
  city: "Ottawa",
  region: "Ontario",
  country: "Canada",
};

function makeRequest(
  overrides: Partial<MembershipRequestSummary> = {},
): MembershipRequestSummary {
  return {
    id: "membership-1",
    organisationId: orgA.id,
    userId: "member-1",
    status: "pending",
    membershipType: "",
    requestedAt: "2026-08-25T00:00:00.000Z",
    invitedAt: null,
    invitedBy: null,
    decidedAt: null,
    decidedBy: null,
    expiresAt: null,
    createdAt: "2026-08-25T00:00:00.000Z",
    updatedAt: "2026-08-25T00:00:00.000Z",
    memberEmail: "nila@example.com",
    connectionType: "",
    connectionContext: "",
    connectionContextExtra: "",
    memberFullName: "Nila Raj",
    memberPhone: "",
    memberCity: "",
    memberRegion: "",
    memberCountry: "",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  searchParams = new URLSearchParams();
});

describe("ManagerPeople", () => {
  it("shows an empty state for a user who manages no organisation", async () => {
    platform({});
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([]),
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<ManagerPeople />);

    await waitFor(() =>
      expect(
        screen.getByText("You don't manage an organisation"),
      ).toBeInTheDocument(),
    );
  });

  it("shows a picker when the user manages more than one organisation and none is selected", async () => {
    platform({});
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([orgA, orgB]),
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<ManagerPeople />);

    await waitFor(() =>
      expect(screen.getByText("Choose an organisation")).toBeInTheDocument(),
    );
    expect(screen.getByText("Organisation A")).toBeInTheDocument();
    expect(screen.getByText("Organisation B")).toBeInTheDocument();
  });

  it("shows a clear message when the selected organisation isn't one the user manages", async () => {
    searchParams = new URLSearchParams({ organization: "org-not-managed" });
    platform({});
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([orgA]),
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<ManagerPeople />);

    await waitFor(() =>
      expect(
        screen.getByText("You don't manage this organisation"),
      ).toBeInTheDocument(),
    );
  });

  it("shows the pending queue for the selected organisation, and lets a manager approve", async () => {
    searchParams = new URLSearchParams({ organization: orgA.id });
    platform({});
    const approveMembership = vi.fn().mockResolvedValue({
      ...makeRequest(),
      status: "approved",
    });
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([orgA]),
      listOrganisationMembershipRequests: vi
        .fn()
        .mockResolvedValue([makeRequest()]),
      listOrganisationManagers: vi.fn().mockResolvedValue([]),
      approveMembership,
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<ManagerPeople />);

    await waitFor(() =>
      expect(screen.getByText("Nila Raj")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { name: "Organisation A" }),
    ).toBeInTheDocument();

    screen.getByRole("button", { name: "Confirm member" }).click();

    await waitFor(() =>
      expect(approveMembership).toHaveBeenCalledWith("membership-1"),
    );
  });

  it("H4 visual QA fix: a decided affiliation never appears under the 'Pending affiliation confirmations' heading", async () => {
    searchParams = new URLSearchParams({ organization: orgA.id });
    platform({});
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([orgA]),
      listOrganisationMembershipRequests: vi.fn().mockResolvedValue([
        makeRequest({ id: "membership-pending", memberFullName: "Nila Raj" }),
        makeRequest({
          id: "membership-active",
          status: "approved",
          memberFullName: "Kavi Selvam",
        }),
      ]),
      listOrganisationManagers: vi.fn().mockResolvedValue([]),
    } as unknown as ReturnType<typeof useMembershipService>);

    render(<ManagerPeople />);

    await waitFor(() =>
      expect(screen.getByText("Nila Raj")).toBeInTheDocument(),
    );
    expect(screen.getByText("Kavi Selvam")).toBeInTheDocument();

    const pendingHeading = screen.getByRole("heading", {
      name: "Pending affiliation confirmations",
    });
    const otherHeading = screen.getByRole("heading", {
      name: "Other affiliations",
    });
    // The pending row sits after its own heading and before the
    // "Other affiliations" heading; the already-decided row sits after
    // that second heading — proving the decided row is never presented
    // as something still awaiting confirmation.
    const position = (a: Node, b: Node) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
    expect(position(pendingHeading, screen.getByText("Nila Raj"))).toBeTruthy();
    expect(
      position(otherHeading, screen.getByText("Kavi Selvam")),
    ).toBeTruthy();
    expect(position(screen.getByText("Nila Raj"), otherHeading)).toBeTruthy();
  });

  it("separates Members and Managers into distinct tabs, not a mixed table", async () => {
    searchParams = new URLSearchParams({ organization: orgA.id });
    platform({});
    mockedUseMembershipService.mockReturnValue({
      listMyManagedOrganisations: vi.fn().mockResolvedValue([orgA]),
      listOrganisationMembershipRequests: vi
        .fn()
        .mockResolvedValue([makeRequest()]),
    } as unknown as ReturnType<typeof useMembershipService>);
    mockedUseManagementService.mockReturnValue({
      listManagers: vi.fn().mockResolvedValue([
        {
          id: "manager-grant-1",
          organisationId: orgA.id,
          userId: "manager-1",
          role: "owner",
          grantedAt: "2026-08-25T00:00:00.000Z",
          grantedBy: "manager-1",
          fullName: "Manager",
        },
      ]),
      listInvitations: vi.fn().mockResolvedValue([]),
    } as unknown as ReturnType<typeof useManagementService>);

    render(<ManagerPeople />);

    await waitFor(() =>
      expect(screen.getByText("Nila Raj")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Owner")).not.toBeInTheDocument();

    screen.getByRole("tab", { name: "Managers" }).click();

    // DataTable renders both its desktop <table> and mobile <ul> markup
    // simultaneously (jsdom applies no real viewport/media-query
    // filtering), so the same cell text legitimately appears twice.
    await waitFor(() =>
      expect(screen.getAllByText("Owner").length).toBeGreaterThan(0),
    );
    expect(screen.queryByText("Nila Raj")).not.toBeInTheDocument();
  });
});
