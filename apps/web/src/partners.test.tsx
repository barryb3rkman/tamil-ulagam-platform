import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PartnersPage from "@/app/partners/page";
import { images, partnersEditorialImageKeys } from "@/config/images";
import { partnersContent } from "@/content/partners";

afterEach(() => cleanup());

describe("public Partners page", () => {
  it("renders one partnership heading and the approved registry image", () => {
    render(<PartnersPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      partnersContent.hero.title,
    );
    expect(screen.getByText(partnersContent.hero.status)).toBeVisible();
    expect(screen.getByText(partnersContent.hero.caption)).toBeVisible();
    for (const key of partnersEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("keeps public relationship claims and early discussion language honest", () => {
    render(<PartnersPage />);

    expect(
      screen.getByText(
        "No approved partner directory is being presented on this page at this stage.",
      ),
    ).toBeVisible();
    expect(screen.getByText(partnersContent.interest.notice)).toBeVisible();
    expect(
      screen.getByText(partnersContent.governance.privacyStatement),
    ).toBeVisible();
    expect(
      screen.queryByText(/trusted by|supported by|our partners/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /logo/i }),
    ).not.toBeInTheDocument();
  });

  it("renders categories, models, pathway, due diligence, governance, statuses, and readiness", () => {
    render(<PartnersPage />);

    for (const category of partnersContent.categories.items) {
      expect(screen.getByText(category)).toBeVisible();
    }
    for (const model of partnersContent.collaborationModels.models) {
      expect(screen.getByRole("heading", { name: model.title })).toBeVisible();
    }
    for (const item of partnersContent.boundaries.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    for (const step of partnersContent.pathway.steps) {
      expect(screen.getByRole("heading", { name: step.title })).toBeVisible();
    }
    for (const item of partnersContent.dueDiligence.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    for (const group of partnersContent.governance.groups) {
      expect(screen.getByRole("heading", { name: group.title })).toBeVisible();
    }
    for (const status of partnersContent.statusModel.statuses) {
      expect(screen.getAllByText(status)[0]).toBeVisible();
    }
    for (const group of partnersContent.initiatives.groups) {
      expect(screen.getByRole("heading", { name: group.title })).toBeVisible();
    }
    for (const item of partnersContent.readiness.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
  });

  it("keeps Tamil ID, chapters, roadmap, initiative, contact and FAQ routes available", () => {
    render(<PartnersPage />);

    expect(
      screen.getByRole("link", { name: "Explore Tamil ID" }),
    ).toHaveAttribute("href", "/tamil-id");
    expect(
      screen.getByRole("link", { name: "Explore Opportunity" }),
    ).toHaveAttribute("href", "/initiatives/business");
    for (const link of screen.getAllByRole("link", {
      name: "View the Roadmap",
    })) {
      expect(link).toHaveAttribute("href", "/roadmap");
    }
    expect(
      screen.getAllByRole("link", { name: "Contact Tamil Ulagam" })[0],
    ).toHaveAttribute("href", "/contact");
    for (const faq of partnersContent.faqs) {
      expect(screen.getByText(faq.title)).toBeVisible();
      expect(screen.getByText(faq.description)).toBeVisible();
    }
  });
});
