import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import AboutPage from "@/app/about/page";
import { aboutEditorialImageKeys, images } from "@/config/images";
import { aboutContent } from "@/content/about";

afterEach(() => cleanup());

describe("public About page", () => {
  it("renders one h1 and the approved hero content", () => {
    render(<AboutPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      aboutContent.hero.title,
    );
    expect(
      screen.getByRole("link", { name: "Explore Our Vision" }),
    ).toHaveAttribute("href", "/about#vision-mission");
  });

  it("renders the vision, mission, challenge, and six core objectives", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", { name: /Vision and mission/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: aboutContent.visionMission.vision.title,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: aboutContent.visionMission.mission.title,
      }),
    ).toBeVisible();
    for (const statement of aboutContent.challenge.statements) {
      expect(
        screen.getByRole("heading", { name: statement.title }),
      ).toBeVisible();
    }
    for (const objective of aboutContent.objectives.entries) {
      expect(
        screen.getByRole("heading", { name: objective.title }),
      ).toBeVisible();
    }
  });

  it("keeps the connected ecosystem, cultural statement, and routes clear", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", { name: aboutContent.ecosystem.title }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: aboutContent.governance.title }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(aboutContent.culturalStatement.tamil),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Explore Initiatives" }),
    ).toHaveAttribute("href", "/initiatives");
    expect(
      document.querySelector('a[href="/roadmap"]'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/members worldwide|active chapters|partner logo/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/planned|in development|building the foundation/i),
    ).not.toBeInTheDocument();
  });

  it("renders all approved About editorial media from the central registry", () => {
    render(<AboutPage />);

    for (const key of aboutEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });
});
