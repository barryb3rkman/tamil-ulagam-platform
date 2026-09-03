import { fireEvent, render, screen, within } from "@testing-library/react";
import type {
  AdminMembershipSummary,
  MembershipHistoryEvent,
} from "@tamil-ulagam/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminOperations } from "@/features/admin/admin-operations-provider";
import { PlatformServiceError } from "@/lib/supabase/errors";

import { AdminMembershipOperations } from "./admin-membership-operations";

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/memberships",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/features/admin/admin-operations-provider", () => ({
  useAdminOperations: vi.fn(),
}));

function membership(
  overrides: Partial<AdminMembershipSummary> = {},
): AdminMembershipSummary {
  return {
    id: "membership-1",
    organisationId: "org-1",
    organisationName: "Toronto Tamil Sangam",
    organisationKind: "sangam",
    userId: "user-1",
    memberFullName: "Nila Raj",
    memberEmail: "nila@example.org",
    status: "pending",
    membershipType: "individual",
    requestedAt: "2026-09-01T00:00:00.000Z",
    invitedAt: null,
    decidedAt: null,
    decidedByName: "",
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

function mountWith(service: {
  listMemberships: () => Promise<AdminMembershipSummary[]>;
  listMembershipHistory?: () => Promise<MembershipHistoryEvent[]>;
  decideMembership?: ReturnType<typeof vi.fn>;
}) {
  vi.mocked(useAdminOperations).mockReturnValue({
    service: {
      listMembershipHistory: () => Promise.resolve([]),
      decideMembership: vi.fn(() => Promise.resolve()),
      ...service,
    },
    capabilities: { canReviewRegistrations: true, canOperateFederation: true },
    loading: false,
    error: "",
  } as unknown as ReturnType<typeof useAdminOperations>);
  return render(<AdminMembershipOperations />);
}

beforeEach(() => {
  searchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe("AdminMembershipOperations", () => {
  it("refuses to render operations without federation access", () => {
    vi.mocked(useAdminOperations).mockReturnValue({
      service: null,
      capabilities: {
        canReviewRegistrations: false,
        canOperateFederation: false,
      },
      loading: false,
      error: "",
    });
    render(<AdminMembershipOperations />);
    expect(
      screen.getByText(/Federation administrator access is required/i),
    ).toBeVisible();
  });

  it("lists the memberships the service returns", async () => {
    mountWith({
      listMemberships: () =>
        Promise.resolve([
          membership(),
          membership({
            id: "membership-2",
            memberFullName: "Arun Kumar",
            organisationName: "Chennai Education Trust",
            organisationKind: "organisation",
          }),
        ]),
    });
    expect((await screen.findAllByText("Nila Raj"))[0]).toBeVisible();
    expect(screen.getAllByText("Arun Kumar")[0]).toBeVisible();
  });

  it("surfaces a load failure instead of an empty table", async () => {
    mountWith({
      listMemberships: () =>
        Promise.reject(new PlatformServiceError("Connection lost", "unknown")),
    });
    expect(await screen.findByText(/Connection lost/i)).toBeVisible();
  });

  it("filters by the search box", async () => {
    mountWith({
      listMemberships: () =>
        Promise.resolve([
          membership(),
          membership({ id: "membership-2", memberFullName: "Arun Kumar" }),
        ]),
    });
    await screen.findAllByText("Nila Raj");
    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: "arun" },
    });
    expect(screen.queryAllByText("Nila Raj")).toHaveLength(0);
    expect(screen.getAllByText("Arun Kumar")[0]).toBeVisible();
  });

  it("will not record a rejection without a reason, and says so", async () => {
    const decideMembership = vi.fn(() => Promise.resolve());
    searchParams = new URLSearchParams("membership=membership-1");
    mountWith({
      listMemberships: () => Promise.resolve([membership()]),
      decideMembership,
    });
    await screen.findAllByText("Nila Raj");

    fireEvent.click(screen.getByRole("button", { name: "Not a member" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Not a member" }),
    );

    expect(
      await screen.findByText(/Enter a clear reason for this decision/i),
    ).toBeVisible();
    expect(decideMembership).not.toHaveBeenCalled();
  });

  it("records an approval, which needs no reason", async () => {
    const decideMembership = vi.fn(() => Promise.resolve());
    searchParams = new URLSearchParams("membership=membership-1");
    mountWith({
      listMemberships: () => Promise.resolve([membership()]),
      decideMembership,
    });
    await screen.findAllByText("Nila Raj");

    fireEvent.click(screen.getByRole("button", { name: "Confirm member" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm member" }),
    );

    await vi.waitFor(() => {
      expect(decideMembership).toHaveBeenCalledWith(
        "membership-1",
        "approve",
        undefined,
      );
    });
  });
});
