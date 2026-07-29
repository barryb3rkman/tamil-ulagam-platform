import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import InitiativesPage from "@/app/initiatives/page";
import { initiativesEditorialImageKeys, images } from "@/config/images";
import { initiatives } from "@/content/initiatives";
import {
  initiativeOverviewContent,
  initiativeOverviewDetails,
} from "@/content/initiatives-overview";

afterEach(() => cleanup());

describe("public Initiatives overview page", () => {
  it("renders one h1, all initiative identities, routes, and statuses", () => {
    render(<InitiativesPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      initiativeOverviewContent.hero.title,
    );
    expect(screen.getAllByText("Planned").length).toBeGreaterThanOrEqual(
      initiatives.length,
    );

    for (const initiative of initiatives) {
      expect(screen.getAllByText(initiative.title).length).toBeGreaterThan(0);
      expect(
        screen.getAllByRole("link", { name: new RegExp(initiative.title) })[0],
      ).toHaveAttribute("href", initiative.href);
      expect(initiativeOverviewDetails[initiative.slug]).toBeDefined();
    }
  });

  it("keeps ecosystem groups complete, unique, and clearly planned", () => {
    const groupedSlugs = initiativeOverviewContent.groups.flatMap(
      (group) => group.initiativeSlugs,
    );
    const slugs = initiatives.map((initiative) => initiative.slug);
    const hrefs = initiatives.map((initiative) => initiative.href);

    expect(groupedSlugs).toHaveLength(initiatives.length);
    expect(new Set(groupedSlugs).size).toBe(groupedSlugs.length);
    expect(new Set(groupedSlugs)).toEqual(new Set(slugs));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toEqual([
      "/initiatives/healthcare",
      "/initiatives/education",
      "/initiatives/business",
      "/initiatives/jobs",
      "/initiatives/research",
      "/initiatives/tourism",
      "/initiatives/arts-culture",
      "/initiatives/global-events",
    ]);

    render(<InitiativesPage />);
    const humanDevelopmentSection = screen.getByRole("region", {
      name: "Wellbeing and learning, built with care.",
    });
    expect(
      within(humanDevelopmentSection).getByRole("heading", {
        name: "Healthcare",
      }),
    ).toBeVisible();
    expect(
      within(humanDevelopmentSection).getByRole("heading", {
        name: "Education",
      }),
    ).toBeVisible();
    expect(
      screen.getByText("Planned shared platform foundation"),
    ).toBeVisible();
    expect(
      screen.getByText(/will not launch empty marketplaces/i),
    ).toBeVisible();
    expect(
      screen.queryByText(/book now|apply now|register now|available today/i),
    ).not.toBeInTheDocument();
    for (const detail of Object.values(initiativeOverviewDetails)) {
      expect(detail.availabilityStatement.toLowerCase()).toMatch(
        /not currently|cannot currently|not available|no .*currently available/,
      );
    }
  });

  it("uses registry media and preserves the key public pathways", () => {
    render(<InitiativesPage />);

    for (const key of initiativesEditorialImageKeys) {
      expect(
        screen.getAllByRole("img", { name: images[key].alt }).length,
      ).toBeGreaterThan(0);
    }
    expect(
      screen.getByRole("link", { name: "Explore the ecosystem" }),
    ).toHaveAttribute("href", "#ecosystem");
    expect(
      screen.getAllByRole("link", { name: "View the roadmap" })[0],
    ).toHaveAttribute("href", "/roadmap");
    expect(
      screen.getByRole("link", { name: "Explore Tamil ID" }),
    ).toHaveAttribute("href", "/tamil-id");
    expect(
      screen.getByRole("link", { name: "Partner with Tamil Ulagam" }),
    ).toHaveAttribute("href", "/partners");
    expect(screen.getByTestId("initiatives-directory")).toBeVisible();
  });
});
