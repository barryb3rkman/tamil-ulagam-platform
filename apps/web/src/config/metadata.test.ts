import { afterEach, describe, expect, it } from "vitest";

import { getAbsoluteSiteUrl } from "./metadata";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("deployment metadata URLs", () => {
  it("keeps routes beneath the project-site path with trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://example.github.io/tamil-ulagam-platform";

    expect(getAbsoluteSiteUrl("/")).toBe(
      "https://example.github.io/tamil-ulagam-platform/",
    );
    expect(getAbsoluteSiteUrl("/about")).toBe(
      "https://example.github.io/tamil-ulagam-platform/about/",
    );
  });

  it("does not append slashes to static files", () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://example.github.io/tamil-ulagam-platform";

    expect(getAbsoluteSiteUrl("/sitemap.xml")).toBe(
      "https://example.github.io/tamil-ulagam-platform/sitemap.xml",
    );
    expect(
      getAbsoluteSiteUrl("/images/tamil-ulagam/pages/roadmap-future.png"),
    ).toBe(
      "https://example.github.io/tamil-ulagam-platform/images/tamil-ulagam/pages/roadmap-future.png",
    );
  });
});
