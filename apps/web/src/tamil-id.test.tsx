import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TamilIdPage from "@/app/tamil-id/page";
import { images, tamilIdEditorialImageKeys } from "@/config/images";
import { tamilIdContent } from "@/content/tamil-id";

afterEach(() => cleanup());

describe("public Tamil ID concept page", () => {
  it("renders one planned concept heading and the approved registry image", () => {
    render(<TamilIdPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      tamilIdContent.hero.title,
    );
    expect(screen.getByText(tamilIdContent.hero.status)).toBeVisible();
    expect(screen.getByText(tamilIdContent.hero.caption)).toBeVisible();
    expect(
      screen.getByRole("img", {
        name: images[tamilIdContent.hero.imageKey].alt,
      }),
    ).toBeVisible();
  });

  it("keeps the membership concept honest and distinct from official identification", () => {
    render(<TamilIdPage />);

    expect(
      screen.getByRole("heading", {
        name: tamilIdContent.notGovernmentId.title,
      }),
    ).toBeVisible();
    expect(screen.getByText("A government-issued identity card")).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /apply now/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/member name:|a\. kumar|priya/i),
    ).not.toBeInTheDocument();
  });

  it("renders every proposed journey, privacy, status, rollout, and FAQ item", () => {
    render(<TamilIdPage />);

    for (const step of tamilIdContent.journey.steps) {
      expect(screen.getByRole("heading", { name: step.title })).toBeVisible();
    }
    expect(
      screen.getByText(
        "Sensitive personal data should not be stored directly in the QR.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Possible public verification information",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: "Information that must remain private",
      }),
    ).toBeVisible();
    for (const principle of tamilIdContent.privacy.principles) {
      expect(
        screen.getByRole("heading", { name: principle.title }),
      ).toBeVisible();
    }
    for (const state of tamilIdContent.governance.states) {
      expect(screen.getByText(state)).toBeVisible();
    }
    for (const phase of tamilIdContent.rollout.phases) {
      expect(screen.getByRole("heading", { name: phase.title })).toBeVisible();
    }
    for (const faq of tamilIdContent.faqs) {
      expect(screen.getByText(faq.title)).toBeVisible();
      expect(screen.getByText(faq.description)).toBeVisible();
    }
  });

  it("keeps roadmap, partner, contact and registry references centralised", () => {
    render(<TamilIdPage />);

    expect(
      screen.getByRole("link", { name: "View the Roadmap" }),
    ).toHaveAttribute("href", "/roadmap");
    expect(
      screen.getByRole("link", { name: "Explore the Roadmap" }),
    ).toHaveAttribute("href", "/roadmap");
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
