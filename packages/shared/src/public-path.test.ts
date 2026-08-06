import { describe, expect, it } from "vitest";

import { withBasePath } from "./public-path";

describe("withBasePath", () => {
  it("prefixes root-relative assets once in project-site mode", () => {
    expect(
      withBasePath(
        "/images/tamil-ulagam/home/home-hero-desktop.png",
        "/tamil-ulagam-platform",
      ),
    ).toBe(
      "/tamil-ulagam-platform/images/tamil-ulagam/home/home-hero-desktop.png",
    );

    expect(
      withBasePath(
        "/tamil-ulagam-platform/images/tamil-ulagam/home/home-hero-desktop.png",
        "/tamil-ulagam-platform",
      ),
    ).toBe(
      "/tamil-ulagam-platform/images/tamil-ulagam/home/home-hero-desktop.png",
    );
  });

  it("preserves root mode and non-public URL forms", () => {
    expect(withBasePath("/images/example.png")).toBe("/images/example.png");
    expect(withBasePath("https://example.com/image.png", "/project")).toBe(
      "https://example.com/image.png",
    );
    expect(withBasePath("//cdn.example.com/image.png", "/project")).toBe(
      "//cdn.example.com/image.png",
    );
    expect(withBasePath("#section", "/project")).toBe("#section");
    expect(withBasePath("data:image/svg+xml,example", "/project")).toBe(
      "data:image/svg+xml,example",
    );
  });

  it("rejects a malformed base path", () => {
    expect(() => withBasePath("/image.png", "project")).toThrow(
      "A base path must start with a forward slash.",
    );
  });
});
