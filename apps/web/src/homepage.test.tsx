import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { homepageEditorialImageKeys, images } from "@/config/images";
import { homepageContent } from "@/content/homepage";
import { initiatives } from "@/content/initiatives";

afterEach(() => cleanup());

describe("public homepage composition", () => {
  it("renders one primary heading and the hero routes", () => {
    render(<HomePage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Connecting the Global Tamil Community",
    );
    expect(
      screen.getAllByRole("link", { name: "Join Tamil Ulagam" })[0],
    ).toHaveAttribute("href", "/join");
    expect(
      screen.getByRole("link", { name: "Explore our vision" }),
    ).toHaveAttribute("href", "/about");
  });

  it("renders all pillars and initiatives from typed content", () => {
    render(<HomePage />);

    for (const title of ["Connect", "Empower", "Preserve"]) {
      expect(
        screen.getAllByRole("heading", { name: title, level: 3 }),
      ).toHaveLength(1);
    }
    for (const objective of homepageContent.visionSignals) {
      expect(screen.getByText(objective, { selector: "span" })).toBeVisible();
    }
    const { presentation } = homepageContent.initiatives;
    const desktopSlugs = [...presentation.featured, ...presentation.medium];
    for (const initiative of initiatives) {
      const onDesktop = desktopSlugs.some((slug) => slug === initiative.slug);
      const onMobile = presentation.mobileFeatured.some(
        (slug) => slug === initiative.slug,
      );
      expect(
        screen.queryAllByRole("heading", { name: initiative.title, level: 3 }),
      ).toHaveLength(Number(onDesktop) + Number(onMobile));
    }
    expect(
      screen
        .getByTestId("initiative-desktop-grid")
        .querySelectorAll('[data-testid="initiative-card"]'),
    ).toHaveLength(desktopSlugs.length);
    expect(
      screen
        .getByTestId("initiative-mobile-grid")
        .querySelectorAll('[data-testid="initiative-card"]'),
    ).toHaveLength(4);
    expect(
      screen.getByRole("link", { name: /Explore All Initiatives/ }),
    ).toHaveAttribute("href", "/initiatives");
    expect(screen.queryByText(/roadmap/i)).not.toBeInTheDocument();
    expect(
      homepageContent.initiatives.presentation.mobileFeatured,
    ).toHaveLength(4);
    expect(
      screen.queryByText(/planned|in development|concept preview/i),
    ).not.toBeInTheDocument();
  });

  it("keeps the hero desktop and mobile assets configured", () => {
    expect(images.homeHero.available).toBe(true);
    expect(images.homeHero.path).toContain("home-hero-desktop.png");
    expect(images.homeHero.mobilePath).toContain("home-hero-mobile.png");
  });

  it("renders every major editorial image from the shared registry", () => {
    render(<HomePage />);

    for (const key of homepageEditorialImageKeys) {
      const matches = screen.getAllByRole("img", { name: images[key].alt });
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBeVisible();
    }
  });
});
