import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { useMembershipService } from "@/features/membership/use-membership-service";

import { AffiliationCard } from "./affiliation-card";

vi.mock("@/features/membership/use-membership-service", () => ({
  useMembershipService: vi.fn(),
}));

const mockedUseMembershipService = vi.mocked(useMembershipService);

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function mockShowModal(
      this: HTMLDialogElement,
    ) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function mockClose(
      this: HTMLDialogElement,
    ) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

const org: EligibleOrganisation = {
  id: "organisation-1",
  name: "Toronto Tamil Sangam",
  category: "tamil_community",
  subtype: "Tamil Sangam",
  city: "Toronto",
  region: "Ontario",
  country: "Canada",
};

function makeMembership(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "membership-1",
    organisationId: org.id,
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AffiliationCard", () => {
  it("shows a Leave organisation action for an approved affiliation, and confirms before calling the RPC", async () => {
    const leaveMembership = vi
      .fn()
      .mockResolvedValue(makeMembership({ status: "revoked" }));
    mockedUseMembershipService.mockReturnValue({
      leaveMembership,
    } as unknown as ReturnType<typeof useMembershipService>);
    const onLeft = vi.fn();

    render(
      <AffiliationCard
        organisation={org}
        membership={makeMembership()}
        onLeft={onLeft}
      />,
    );

    expect(leaveMembership).not.toHaveBeenCalled();
    screen.getByRole("button", { name: "Leave organisation" }).click();

    const dialog = await screen.findByRole("dialog", {
      name: /Leave Toronto Tamil Sangam\?/,
    });
    expect(dialog).toBeInTheDocument();

    screen.getByRole("button", { name: "Confirm leave" }).click();

    await waitFor(() =>
      expect(leaveMembership).toHaveBeenCalledWith("membership-1"),
    );
    await waitFor(() => expect(onLeft).toHaveBeenCalled());
  });

  it("offers a Request again link for a rejected affiliation, not a Leave action", () => {
    mockedUseMembershipService.mockReturnValue(
      {} as unknown as ReturnType<typeof useMembershipService>,
    );

    render(
      <AffiliationCard
        organisation={org}
        membership={makeMembership({ status: "rejected" })}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Leave organisation" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request again" })).toHaveAttribute(
      "href",
      "/join/member",
    );
  });

  it("shows a pending affiliation with neither a Leave nor a Request-again action", () => {
    mockedUseMembershipService.mockReturnValue(
      {} as unknown as ReturnType<typeof useMembershipService>,
    );

    render(
      <AffiliationCard
        organisation={org}
        membership={makeMembership({
          status: "pending",
          decidedAt: null,
          decidedBy: null,
        })}
      />,
    );

    expect(screen.getByText("Pending review")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Leave organisation" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Request again" }),
    ).not.toBeInTheDocument();
  });
});
