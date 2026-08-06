import { describe, expect, it } from "vitest";

import { isNavigationPathCurrent } from "./navigation-path";

describe("isNavigationPathCurrent", () => {
  it("matches route paths with or without a trailing slash", () => {
    expect(isNavigationPathCurrent("/chapters/", "/chapters")).toBe(true);
    expect(isNavigationPathCurrent("/chapters", "/chapters")).toBe(true);
  });

  it("keeps initiative detail pages within the initiatives section", () => {
    expect(
      isNavigationPathCurrent("/initiatives/healthcare/", "/initiatives"),
    ).toBe(true);
  });

  it("does not mark unrelated routes as current", () => {
    expect(isNavigationPathCurrent("/news/", "/events")).toBe(false);
  });
});
