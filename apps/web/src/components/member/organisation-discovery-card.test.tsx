import { cleanup, render, screen } from "@testing-library/react";
import type { EligibleOrganisation, Membership } from "@tamil-ulagam/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OrganisationDiscoveryCard } from "./organisation-discovery-card";

afterEach(() => cleanup());

const org: EligibleOrganisation = {
  id: "organisation-1",
  name: "Toronto Tamil Sangam",
  category: "tamil_community",
  subtype: "Tamil Sangam",
  city: "Toronto",
  region: "Ontario",
  country: "Canada",
};

function makeMembership(status: Membership["status"]): Membership {
  return {
    id: "membership-1",
    organisationId: org.id,
    userId: "user-1",
    status,
    membershipType: "",
    requestedAt: "2026-08-25T00:00:00.000Z",
    invitedAt: null,
    invitedBy: null,
    decidedAt: null,
    decidedBy: null,
    expiresAt: null,
    createdAt: "2026-08-25T00:00:00.000Z",
    updatedAt: "2026-08-25T00:00:00.000Z",
    memberEmail: "",
    connectionType: "",
    connectionContext: "",
    connectionContextExtra: "",
  };
}

describe("OrganisationDiscoveryCard", () => {
  it("shows a Choose organisation action when there is no existing relationship", () => {
    const onSelect = vi.fn();
    render(
      <OrganisationDiscoveryCard organisation={org} onSelect={onSelect} />,
    );

    const button = screen.getByRole("button", { name: "Select" });
    button.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("shows Pending review status without a clickable action for a pending request", () => {
    render(
      <OrganisationDiscoveryCard
        organisation={org}
        existingMembership={makeMembership("pending")}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Pending confirmation")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select" }),
    ).not.toBeInTheDocument();
  });

  it("shows an approved-member status without a Choose action", () => {
    render(
      <OrganisationDiscoveryCard
        organisation={org}
        existingMembership={makeMembership("approved")}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select" }),
    ).not.toBeInTheDocument();
  });

  it("offers a Submit again action for a rejected/revoked prior relationship", () => {
    const onSelect = vi.fn();
    render(
      <OrganisationDiscoveryCard
        organisation={org}
        existingMembership={makeMembership("revoked")}
        onSelect={onSelect}
      />,
    );

    const button = screen.getByRole("button", { name: "Submit again" });
    button.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("labels a Tamil Sangam organisation distinctly from a plain organisation category", () => {
    render(
      <OrganisationDiscoveryCard
        organisation={{ ...org, subtype: "" }}
        onSelect={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Tamil / Community Organisation"),
    ).toBeInTheDocument();

    cleanup();

    render(<OrganisationDiscoveryCard organisation={org} onSelect={vi.fn()} />);
    expect(screen.getByText("Tamil Sangam")).toBeInTheDocument();
  });
});
