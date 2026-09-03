import { cleanup, render, screen, fireEvent } from "@testing-library/react";
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
    expect(screen.getByText(partnersContent.hero.caption)).toBeVisible();
    for (const key of partnersEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("keeps public relationship claims and discussion language honest", () => {
    render(<PartnersPage />);

    expect(
      screen.getByText(partnersContent.boundaries.statement),
    ).toBeVisible();
    expect(
      screen.queryByText(/trusted by|supported by|our partners/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /logo/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/planned|proposed|approval pending/i),
    ).not.toBeInTheDocument();
  });

  it("renders PPT partner categories and concise collaboration models", () => {
    render(<PartnersPage />);

    for (const category of partnersContent.categories.items) {
      expect(screen.getByText(category)).toBeVisible();
    }
    for (const model of partnersContent.collaborationModels.models) {
      expect(screen.getByRole("heading", { name: model.title })).toBeVisible();
    }
    expect(
      screen.getByText(partnersContent.boundaries.statement),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: partnersContent.boundaries.title }),
    );
    for (const item of partnersContent.boundaries.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    expect(
      screen.queryByText(/Tamil Nadu Government|UNESCO|IIT Madras/),
    ).not.toBeInTheDocument();
  });

  it("keeps roadmap, contact and FAQ routes available", () => {
    render(<PartnersPage />);

    for (const link of screen.getAllByRole("link", {
      name: "Join Tamil Ulagam",
    })) {
      expect(link).toHaveAttribute("href", "/join");
    }
    expect(
      screen.getAllByRole("link", { name: "Contact Tamil Ulagam" })[0],
    ).toHaveAttribute("href", "/contact");
    for (const faq of partnersContent.faqs) {
      expect(screen.getByText(faq.title)).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: faq.title }));
      expect(screen.getByText(faq.description)).toBeVisible();
    }
  });
});
