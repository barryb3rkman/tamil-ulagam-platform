import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import RoadmapPage from "@/app/roadmap/page";
import { images, roadmapEditorialImageKeys } from "@/config/images";
import { roadmapPageContent } from "@/content/roadmap-page";
import { roadmapPhases } from "@/content/roadmap";

afterEach(() => cleanup());

describe("public Roadmap page", () => {
  it("renders one strategic heading, current focus, and the approved registry image", () => {
    render(<RoadmapPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      roadmapPageContent.hero.title,
    );
    expect(screen.getByText(roadmapPageContent.hero.status)).toBeVisible();
    expect(screen.getByText(roadmapPageContent.hero.caption)).toBeVisible();
    expect(
      screen.getByText(roadmapPageContent.foundation.status),
    ).toBeVisible();
    expect(
      screen.getByRole("img", {
        name: images[roadmapPageContent.hero.imageKey].alt,
      }),
    ).toBeVisible();
  });

  it("renders the authoritative phase sequence once and in the required order", () => {
    render(<RoadmapPage />);

    expect(new Set(roadmapPhases.map((phase) => phase.id))).toHaveLength(
      roadmapPhases.length,
    );
    expect(roadmapPhases.map((phase) => phase.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
    ]);

    for (const phase of roadmapPhases) {
      expect(screen.getByRole("heading", { name: phase.title })).toBeVisible();
      expect(screen.getByText(phase.statusLabel)).toBeVisible();
    }

    expect(roadmapPhases[1].title).toBe("Identity and Membership");
    expect(roadmapPhases[2].title).toBe("Chapters, Organisations and Events");
    expect(roadmapPhases[4].title).toBe(
      "Mobile Access and Member Communication",
    );
    expect(roadmapPhases[5].statusLabel).toBe("Long-Term Direction");
  });

  it("keeps readiness, quality, adaptability, and public descriptions honest", () => {
    render(<RoadmapPage />);

    for (const gate of roadmapPageContent.readiness.items) {
      expect(screen.getByText(gate)).toBeVisible();
    }
    for (const principle of roadmapPageContent.quality.principles) {
      expect(screen.getByText(principle)).toBeVisible();
    }
    for (const item of roadmapPageContent.adaptability.mayChange) {
      expect(screen.getAllByText(item)[0]).toBeVisible();
    }
    for (const item of roadmapPageContent.adaptability.remainsStable) {
      expect(screen.getAllByText(item)[0]).toBeVisible();
    }
    for (const faq of roadmapPageContent.faqs) {
      expect(screen.getByText(faq.title)).toBeVisible();
      expect(screen.getByText(faq.description)).toBeVisible();
    }

    expect(screen.queryByText(/available worldwide/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/fully operational/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/completion percentage/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/launching on/i)).not.toBeInTheDocument();
  });

  it("keeps implemented routes and registry references centralised", () => {
    render(<RoadmapPage />);

    expect(
      screen.getAllByRole("link", { name: "Explore Tamil ID" })[0],
    ).toHaveAttribute("href", "/tamil-id");
    expect(
      screen.getAllByRole("link", { name: "Explore Chapters" })[0],
    ).toHaveAttribute("href", "/chapters");
    expect(
      screen.getAllByRole("link", { name: "Explore Initiatives" })[0],
    ).toHaveAttribute("href", "/initiatives");
    expect(
      screen.getAllByRole("link", { name: "Partner With Tamil Ulagam" })[0],
    ).toHaveAttribute("href", "/partners");
    expect(
      screen.getAllByRole("link", { name: "Contact Us" })[0],
    ).toHaveAttribute("href", "/contact");
    for (const key of roadmapEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });
});
