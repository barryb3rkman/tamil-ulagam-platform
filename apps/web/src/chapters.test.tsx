import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ChaptersPage from "@/app/chapters/page";
import { chaptersEditorialImageKeys, images } from "@/config/images";
import { chaptersContent } from "@/content/chapters";

afterEach(() => cleanup());

describe("public Chapters page", () => {
  it("renders one planned chapter-network heading and central registry media", () => {
    render(<ChaptersPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      chaptersContent.hero.title,
    );
    expect(screen.getByText(chaptersContent.hero.status)).toBeVisible();
    expect(screen.getByText(chaptersContent.hero.caption)).toBeVisible();
    for (const key of chaptersEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("keeps chapter availability and location claims honest", () => {
    render(<ChaptersPage />);

    expect(
      screen.getByText(
        "No active chapter directory is being presented at this stage. The page explains the planned chapter model.",
      ),
    ).toBeVisible();
    expect(screen.getByText(chaptersContent.interest.notice)).toBeVisible();
    expect(
      screen.queryByText(
        /chapters worldwide|find your local chapter|chapter office/i,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /search|filter/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the formation, governance, relationships, statuses, directory, and readiness model", () => {
    render(<ChaptersPage />);

    expect(
      screen.getByRole("heading", { name: chaptersContent.definition.title }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: chaptersContent.relationship.federation.title,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: chaptersContent.relationship.chapter.title,
      }),
    ).toBeVisible();
    for (const step of chaptersContent.formationJourney.steps) {
      expect(screen.getByRole("heading", { name: step.title })).toBeVisible();
    }
    for (const principle of chaptersContent.governance.principles) {
      expect(
        screen.getByRole("heading", { name: principle.title }),
      ).toBeVisible();
    }
    for (const group of chaptersContent.relationships.groups) {
      expect(screen.getByRole("heading", { name: group.title })).toBeVisible();
    }
    expect(
      screen.getByText(chaptersContent.relationships.privacyStatement),
    ).toBeVisible();
    for (const status of chaptersContent.statusModel.statuses) {
      expect(screen.getAllByText(status)[0]).toBeVisible();
    }
    expect(screen.getByText(chaptersContent.directory.status)).toBeVisible();
    for (const requirement of chaptersContent.readiness.requirements) {
      expect(screen.getByText(requirement)).toBeVisible();
    }
  });

  it("keeps Tamil ID, roadmap, partner, and contact routes available", () => {
    render(<ChaptersPage />);

    expect(
      screen.getByRole("link", { name: "Explore Tamil ID" }),
    ).toHaveAttribute("href", "/tamil-id");
    for (const label of ["View the Roadmap", "Explore the Roadmap"]) {
      for (const link of screen.getAllByRole("link", { name: label })) {
        expect(link).toHaveAttribute("href", "/roadmap");
      }
    }
    expect(
      screen.getAllByRole("link", { name: "Contact Tamil Ulagam" })[0],
    ).toHaveAttribute("href", "/contact");
    expect(
      screen.getByRole("link", { name: "Partner With Us" }),
    ).toHaveAttribute("href", "/partners");
    for (const faq of chaptersContent.faqs) {
      expect(screen.getByText(faq.title)).toBeVisible();
      expect(screen.getByText(faq.description)).toBeVisible();
    }
  });
});
