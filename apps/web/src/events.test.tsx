import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import EventsPage from "@/app/events/page";
import { eventsEditorialImageKeys, images } from "@/config/images";
import { eventsContent } from "@/content/events";

afterEach(() => cleanup());

describe("public Events page", () => {
  it("renders one planned-events heading and the approved registry image", () => {
    render(<EventsPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      eventsContent.hero.title,
    );
    expect(
      screen.getByText(eventsContent.hero.status, { exact: true }),
    ).toBeVisible();
    expect(screen.getByText(eventsContent.hero.caption)).toBeVisible();
    for (const key of eventsEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("keeps the page honest about future availability and attendee access", () => {
    render(<EventsPage />);

    expect(screen.getByText(eventsContent.definition.statement)).toBeVisible();
    expect(
      screen.getByText(eventsContent.organiserPathway.description),
    ).toBeVisible();
    expect(screen.getByText(eventsContent.interest.notice)).toBeVisible();
    expect(screen.getByText(eventsContent.privacy.statement)).toBeVisible();
    expect(
      screen.getByText(
        "No live event calendar is being presented at this stage.",
      ),
    ).toBeVisible();
    expect(
      screen.queryByText(/upcoming events|register now|buy tickets/i),
    ).not.toBeInTheDocument();
  });

  it("renders the categories, organiser pathway, lifecycle, registration, privacy, and relationships", () => {
    render(<EventsPage />);

    for (const category of eventsContent.categories.items) {
      expect(
        screen.getAllByRole("heading", { name: category.title })[0],
      ).toBeVisible();
    }
    for (const organiser of eventsContent.organisers.categories) {
      expect(screen.getByText(organiser)).toBeVisible();
    }
    for (const step of eventsContent.organiserPathway.steps) {
      expect(screen.getByRole("heading", { name: step.title })).toBeVisible();
    }
    for (const step of eventsContent.lifecycle.steps) {
      expect(
        screen.getAllByRole("heading", { name: step.title })[0],
      ).toBeVisible();
    }
    for (const principle of eventsContent.registration.principles) {
      expect(screen.getByText(principle)).toBeVisible();
    }
    for (const item of eventsContent.privacy.publicInformation) {
      expect(screen.getAllByText(item)[0]).toBeVisible();
    }
    for (const item of eventsContent.privacy.privateInformation) {
      expect(screen.getAllByText(item)[0]).toBeVisible();
    }
    for (const group of eventsContent.relationships.groups) {
      expect(
        screen.getAllByRole("heading", { name: group.title })[0],
      ).toBeVisible();
    }
  });

  it("renders hybrid safeguards, status models, safety, readiness, routes, and honest FAQs", () => {
    render(<EventsPage />);

    for (const safeguard of eventsContent.hybridArchive.safeguards) {
      expect(screen.getAllByText(safeguard)[0]).toBeVisible();
    }
    for (const status of eventsContent.statusModel.publicStatuses) {
      expect(screen.getAllByText(status)[0]).toBeVisible();
    }
    for (const status of eventsContent.statusModel.administrativeStatuses) {
      expect(screen.getAllByText(status)[0]).toBeVisible();
    }
    for (const principle of eventsContent.safety.principles) {
      expect(screen.getAllByText(principle)[0]).toBeVisible();
    }
    for (const gate of eventsContent.readiness.items) {
      expect(screen.getByText(gate)).toBeVisible();
    }
    expect(
      screen.getByRole("link", { name: "Explore Tamil ID" }),
    ).toHaveAttribute("href", "/tamil-id");
    expect(
      screen.getByRole("link", { name: "Explore Chapters" }),
    ).toHaveAttribute("href", "/chapters");
    expect(
      screen.getByRole("link", { name: "Explore Partners" }),
    ).toHaveAttribute("href", "/partners");
    for (const link of screen.getAllByRole("link", {
      name: "View the Roadmap",
    })) {
      expect(link).toHaveAttribute("href", "/roadmap");
    }
    for (const link of screen.getAllByRole("link", {
      name: "Explore Global Events",
    })) {
      expect(link).toHaveAttribute("href", "/initiatives/global-events");
    }
    expect(
      screen.getAllByRole("link", { name: "Contact Tamil Ulagam" })[0],
    ).toHaveAttribute("href", "/contact");
    for (const faq of eventsContent.faqs) {
      expect(screen.getAllByText(faq.title)[0]).toBeVisible();
      expect(screen.getAllByText(faq.description)[0]).toBeVisible();
    }
  });
});
