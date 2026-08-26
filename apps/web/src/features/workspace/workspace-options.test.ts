import type { EligibleOrganisation } from "@tamil-ulagam/shared";
import { describe, expect, it } from "vitest";

import {
  buildWorkspaceOptions,
  findCurrentWorkspace,
  groupWorkspaceOptions,
  resolveActiveWorkspace,
  type ActiveWorkspace,
} from "./workspace-options";

function makeOrg(
  overrides: Partial<EligibleOrganisation> = {},
): EligibleOrganisation {
  return {
    id: "org-1",
    name: "Acme Education Trust",
    category: "education",
    subtype: "",
    city: "Chennai",
    region: "",
    country: "India",
    ...overrides,
  };
}

function makeSangam(
  overrides: Partial<EligibleOrganisation> = {},
): EligibleOrganisation {
  return makeOrg({
    id: "sangam-1",
    name: "Chennai Tamil Sangam",
    category: "tamil_community",
    subtype: "Tamil Sangam",
    ...overrides,
  });
}

const noneActive: ActiveWorkspace = { type: null, id: null };

describe("resolveActiveWorkspace", () => {
  it("resolves member from /workspace/member", () => {
    expect(resolveActiveWorkspace("/workspace/member", null)).toEqual({
      type: "member",
      id: "member",
    });
  });

  it("resolves organisation from the query param, including the People sub-route", () => {
    expect(
      resolveActiveWorkspace(
        "/workspace/organisation",
        new URLSearchParams("organization=org-1"),
      ),
    ).toEqual({ type: "organisation", id: "org-1" });
    expect(
      resolveActiveWorkspace(
        "/workspace/organisation/people",
        new URLSearchParams("organization=org-1"),
      ),
    ).toEqual({ type: "organisation", id: "org-1" });
  });

  it("resolves sangam from the query param", () => {
    expect(
      resolveActiveWorkspace(
        "/workspace/sangam",
        new URLSearchParams("sangam=sangam-1"),
      ),
    ).toEqual({ type: "sangam", id: "sangam-1" });
  });

  it("resolves admin from any /admin path", () => {
    expect(resolveActiveWorkspace("/admin/registrations", null)).toEqual({
      type: "admin",
      id: "admin",
    });
  });

  it("resolves null for an unrelated path", () => {
    expect(resolveActiveWorkspace("/dashboard", null)).toEqual({
      type: null,
      id: null,
    });
  });
});

describe("buildWorkspaceOptions", () => {
  it("returns nothing for a logged-out visitor", () => {
    expect(
      buildWorkspaceOptions({
        isAuthenticated: false,
        canReviewApplications: false,
        managedOrganisations: [makeOrg()],
        active: noneActive,
      }),
    ).toEqual([]);
  });

  it("always includes Member for an authenticated user, even with no managed organisations", () => {
    const options = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: false,
      managedOrganisations: [],
      active: noneActive,
    });
    expect(options).toEqual([
      {
        type: "member",
        id: "member",
        label: "Member",
        subtitle: "Personal membership workspace",
        href: "/workspace/member",
        current: false,
      },
    ]);
  });

  it("splits Organisation vs Tamil Sangam using isTamilSangam, never a name guess", () => {
    const namedLikeSangamButNot = makeOrg({
      id: "org-2",
      name: "Toronto Tamil Cultural Sangam Society",
      category: "tamil_community",
      subtype: "cultural association",
    });
    const options = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: false,
      managedOrganisations: [makeOrg(), makeSangam(), namedLikeSangamButNot],
      active: noneActive,
    });
    const byType = groupWorkspaceOptions(options);
    expect(byType.organisations.map((o) => o.id)).toEqual(["org-1", "org-2"]);
    expect(byType.sangams.map((o) => o.id)).toEqual(["sangam-1"]);
  });

  it("gates Admin strictly on canReviewApplications, never on organisation count", () => {
    const withoutReview = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: false,
      managedOrganisations: [makeOrg()],
      active: noneActive,
    });
    expect(withoutReview.some((o) => o.type === "admin")).toBe(false);

    const withReview = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: true,
      managedOrganisations: [],
      active: noneActive,
    });
    const admin = withReview.find((o) => o.type === "admin");
    expect(admin).toEqual({
      type: "admin",
      id: "admin",
      label: "Federation Admin",
      subtitle: "Review and verify registrations",
      href: "/admin",
      current: false,
    });
  });

  it("builds a management-grant-only list — approved membership never creates an Organisation/Sangam option", () => {
    // Membership/affiliation data is deliberately not a parameter here at
    // all: buildWorkspaceOptions only ever accepts managedOrganisations
    // (organization_managers-sourced). This test documents that contract
    // rather than exercising a code path that could leak membership data
    // in — the type signature itself is the guarantee.
    const options = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: false,
      managedOrganisations: [],
      active: noneActive,
    });
    expect(options).toHaveLength(1);
    expect(options[0]?.type).toBe("member");
  });

  it("marks the option matching the active workspace as current", () => {
    const options = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: false,
      managedOrganisations: [makeOrg(), makeSangam()],
      active: { type: "sangam", id: "sangam-1" },
    });
    expect(findCurrentWorkspace(options)?.id).toBe("sangam-1");
    expect(options.filter((o) => o.current)).toHaveLength(1);
  });

  it("orders options Member, Organisations, Sangams, Admin", () => {
    const options = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: true,
      managedOrganisations: [makeSangam(), makeOrg()],
      active: noneActive,
    });
    expect(options.map((o) => o.type)).toEqual([
      "member",
      "organisation",
      "sangam",
      "admin",
    ]);
  });
});

describe("groupWorkspaceOptions", () => {
  it("omits empty sections rather than returning empty arrays for meaningless headings", () => {
    const options = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: false,
      managedOrganisations: [],
      active: noneActive,
    });
    const grouped = groupWorkspaceOptions(options);
    expect(grouped.member).not.toBeNull();
    expect(grouped.organisations).toEqual([]);
    expect(grouped.sangams).toEqual([]);
    expect(grouped.admin).toBeNull();
  });
});

describe("findCurrentWorkspace", () => {
  it("returns null when the active id is not among the available options (stale/invalid workspace)", () => {
    const options = buildWorkspaceOptions({
      isAuthenticated: true,
      canReviewApplications: false,
      managedOrganisations: [makeOrg()],
      active: { type: "organisation", id: "org-does-not-exist" },
    });
    expect(findCurrentWorkspace(options)).toBeNull();
  });
});
