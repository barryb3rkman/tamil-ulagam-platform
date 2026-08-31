import { describe, expect, it } from "vitest";

import { moduleHref } from "./module-routes";

describe("moduleHref", () => {
  it("builds a Member module route with no entity id or query param", () => {
    expect(moduleHref("member", null, "events")).toBe(
      "/workspace/member/modules/events",
    );
  });

  it("builds an Organisation module route carrying the organization id", () => {
    expect(moduleHref("organisation", "org-1", "education")).toBe(
      "/workspace/organisation/modules/education?organization=org-1",
    );
  });

  it("builds a Sangam module route carrying the sangam id", () => {
    expect(moduleHref("sangam", "sangam-1", "heritage-arts")).toBe(
      "/workspace/sangam/modules/heritage-arts?sangam=sangam-1",
    );
  });

  it("returns null for Organisation/Sangam with no resolved entity id — never a broken link", () => {
    expect(moduleHref("organisation", null, "events")).toBeNull();
    expect(moduleHref("sangam", null, "events")).toBeNull();
  });

  it("returns null for admin and null — Federation Admin has no module routes in this phase", () => {
    expect(moduleHref("admin", "admin", "events")).toBeNull();
    expect(moduleHref(null, null, "events")).toBeNull();
  });
});
