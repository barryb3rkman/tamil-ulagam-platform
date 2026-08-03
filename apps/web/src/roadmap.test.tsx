import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import RoadmapPage from "@/app/roadmap/page";
import { images, roadmapEditorialImageKeys } from "@/config/images";
import { roadmapPageContent } from "@/content/roadmap-page";
import { roadmapPhases } from "@/content/roadmap";

afterEach(() => cleanup());

describe("public Roadmap page", () => {
  it("renders one strategic heading and the approved registry image", () => {
    render(<RoadmapPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      roadmapPageContent.hero.title,
    );
    expect(screen.getByText(roadmapPageContent.hero.status)).toBeVisible();
    expect(screen.getByText(roadmapPageContent.hero.caption)).toBeVisible();
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
    ]);

    for (const phase of roadmapPhases) {
      expect(screen.getByRole("heading", { name: phase.title })).toBeVisible();
      expect(screen.getAllByText(phase.statusLabel)[0]).toBeVisible();
    }

    expect(roadmapPhases.map((phase) => phase.title)).toEqual([
      "Foundation",
      "Connected Community",
      "Global Services",
    ]);
  });

  it("keeps the phase targets and public descriptions honest", () => {
    render(<RoadmapPage />);

    for (const phase of roadmapPhases) {
      for (const capability of phase.capabilities) {
        expect(screen.getByText(capability)).toBeVisible();
      }
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
    expect(screen.queryByText(/one crore.*20(27|29)/i)).not.toBeInTheDocument();
  });

  it("keeps implemented routes and registry references centralised", () => {
    render(<RoadmapPage />);

    expect(
      screen.getAllByRole("link", { name: "Explore Tamil ID" })[0],
    ).toHaveAttribute("href", "/tamil-id");
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
