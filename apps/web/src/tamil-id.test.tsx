import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TamilIdPage from "@/app/tamil-id/page";
import { images, tamilIdEditorialImageKeys } from "@/config/images";
import { tamilIdContent } from "@/content/tamil-id";

afterEach(() => cleanup());

describe("public Tamil ID page", () => {
  it("renders one digital-membership heading and the approved registry image", () => {
    render(<TamilIdPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      tamilIdContent.hero.title,
    );
    expect(screen.getByText(tamilIdContent.hero.caption)).toBeVisible();
    expect(
      screen.queryByRole("img", {
        name: images[tamilIdContent.hero.imageKey].alt,
      }),
    ).not.toBeInTheDocument();
  });

  it("keeps digital membership distinct from official identification", () => {
    render(<TamilIdPage />);

    expect(
      screen.getByRole("heading", {
        name: tamilIdContent.notGovernmentId.title,
      }),
    ).toBeVisible();
    expect(
      screen.getByText(tamilIdContent.notGovernmentId.description),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", {
        name: tamilIdContent.notGovernmentId.title,
      }),
    );
    expect(screen.getByText("A government-issued identity card")).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /apply now/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/member name:|a\. kumar|priya/i),
    ).not.toBeInTheDocument();
  });

  it("renders the PPT membership vision and concise safeguards", () => {
    render(<TamilIdPage />);

    expect(
      screen.getByText("Community, Professional and Patron membership tiers"),
    ).toBeVisible();
    expect(screen.getByText("Event and service access")).toBeVisible();
    expect(
      screen.queryByText(tamilIdContent.journey.title),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(tamilIdContent.verification.illustrativeUrl),
    ).not.toBeInTheDocument();
    for (const faq of tamilIdContent.faqs) {
      expect(screen.getByText(faq.title)).toBeVisible();
      fireEvent.click(screen.getByRole("button", { name: faq.title }));
      expect(screen.getByText(faq.description)).toBeVisible();
    }
    expect(
      screen.queryByText(/planned|in development|concept preview/i),
    ).not.toBeInTheDocument();
  });

  it("keeps roadmap, partner, contact and registry references centralised", () => {
    render(<TamilIdPage />);

    expect(
      screen.getAllByRole("link", { name: "Join Tamil Ulagam" })[0],
    ).toHaveAttribute("href", "/join");
    expect(
      screen.getByRole("link", { name: "Partner With Tamil Ulagam" }),
    ).toHaveAttribute("href", "/partners");
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "href",
      "/contact",
    );
    for (const key of tamilIdEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });
});
