import { fireEvent, render, screen, within } from "@testing-library/react";
import type {
  PartnershipEnquiry,
  PartnershipHistoryEvent,
} from "@tamil-ulagam/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminOperations } from "@/features/admin/admin-operations-provider";
import { PlatformServiceError } from "@/lib/supabase/errors";

import { AdminPartnershipOperations } from "./admin-partnership-operations";

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/partnerships",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/features/admin/admin-operations-provider", () => ({
  useAdminOperations: vi.fn(),
}));

function enquiry(
  overrides: Partial<PartnershipEnquiry> = {},
): PartnershipEnquiry {
  return {
    id: "enquiry-1",
    name: "Meera Sundaram",
    email: "meera@example.org",
    organisationName: "Global Tamil Studies",
    country: "Canada",
    area: "education",
    message: "We would like to discuss a research collaboration.",
    status: "in_discussion",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

function mountWith(service: {
  listPartnershipEnquiries: () => Promise<PartnershipEnquiry[]>;
  listPartnershipHistory?: () => Promise<PartnershipHistoryEvent[]>;
  transitionPartnership?: ReturnType<typeof vi.fn>;
}) {
  vi.mocked(useAdminOperations).mockReturnValue({
    service: {
      listPartnershipHistory: () => Promise.resolve([]),
      transitionPartnership: vi.fn(() => Promise.resolve()),
      ...service,
    },
    capabilities: { canReviewRegistrations: true, canOperateFederation: true },
    loading: false,
    error: "",
  } as unknown as ReturnType<typeof useAdminOperations>);
  return render(<AdminPartnershipOperations />);
}

beforeEach(() => {
  searchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe("AdminPartnershipOperations", () => {
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
    render(<AdminPartnershipOperations />);
    expect(
      screen.getByText(/Federation administrator access is required/i),
    ).toBeVisible();
  });

  it("lists the enquiries the service returns", async () => {
    mountWith({
      listPartnershipEnquiries: () =>
        Promise.resolve([
          enquiry(),
          enquiry({ id: "enquiry-2", name: "Ravi Anand" }),
        ]),
    });
    expect((await screen.findAllByText("Meera Sundaram"))[0]).toBeVisible();
    expect(screen.getAllByText("Ravi Anand")[0]).toBeVisible();
  });

  it("surfaces a load failure instead of an empty table", async () => {
    mountWith({
      listPartnershipEnquiries: () =>
        Promise.reject(new PlatformServiceError("Connection lost", "unknown")),
    });
    expect(await screen.findByText(/Connection lost/i)).toBeVisible();
  });

  it("filters by the search box", async () => {
    mountWith({
      listPartnershipEnquiries: () =>
        Promise.resolve([
          enquiry(),
          enquiry({ id: "enquiry-2", name: "Ravi Anand" }),
        ]),
    });
    await screen.findAllByText("Meera Sundaram");
    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: "ravi" },
    });
    expect(screen.queryAllByText("Meera Sundaram")).toHaveLength(0);
    expect(screen.getAllByText("Ravi Anand")[0]).toBeVisible();
  });

  it("will not decline an enquiry without a reason, and uses its own wording", async () => {
    const transitionPartnership = vi.fn(() => Promise.resolve());
    searchParams = new URLSearchParams("enquiry=enquiry-1");
    mountWith({
      listPartnershipEnquiries: () => Promise.resolve([enquiry()]),
      transitionPartnership,
    });
    await screen.findAllByText("Meera Sundaram");

    fireEvent.click(screen.getByRole("button", { name: "Decline enquiry" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm status change" }),
    );

    // Deliberately not the membership wording — these two screens phrase
    // the same rule differently and both are asserted.
    expect(
      await screen.findByText(/Enter a reason for declining this enquiry/i),
    ).toBeVisible();
    expect(transitionPartnership).not.toHaveBeenCalled();
  });

  it("records a transition that needs no reason", async () => {
    const transitionPartnership = vi.fn(() => Promise.resolve());
    searchParams = new URLSearchParams("enquiry=enquiry-1");
    mountWith({
      listPartnershipEnquiries: () => Promise.resolve([enquiry()]),
      transitionPartnership,
    });
    await screen.findAllByText("Meera Sundaram");

    fireEvent.click(screen.getByRole("button", { name: "Mark active" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm status change" }),
    );

    await vi.waitFor(() => {
      expect(transitionPartnership).toHaveBeenCalledWith(
        "enquiry-1",
        "active",
        undefined,
      );
    });
  });

  it("refetches the history after a decision, since the record id does not change", async () => {
    const listPartnershipHistory = vi.fn(() => Promise.resolve([]));
    searchParams = new URLSearchParams("enquiry=enquiry-1");
    mountWith({
      listPartnershipEnquiries: () => Promise.resolve([enquiry()]),
      listPartnershipHistory,
    });
    await screen.findAllByText("Meera Sundaram");
    await vi.waitFor(() => {
      expect(listPartnershipHistory).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "Mark active" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm status change" }),
    );

    // Without an explicit reload the strip keeps showing the history as
    // it was before the decision was recorded.
    await vi.waitFor(() => {
      expect(listPartnershipHistory).toHaveBeenCalledTimes(2);
    });
  });
});
