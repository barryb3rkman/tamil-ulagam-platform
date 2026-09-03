import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ChaptersPage from "@/app/chapters/page";
import { chaptersEditorialImageKeys, images } from "@/config/images";
import { chaptersContent } from "@/content/chapters";

afterEach(() => cleanup());

describe("public Chapters page", () => {
  it("renders one chapter-network heading and central registry media", () => {
    render(<ChaptersPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      chaptersContent.hero.title,
    );
    expect(screen.getByText(chaptersContent.hero.caption)).toBeVisible();
    for (const key of chaptersEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("keeps chapter recognition and location claims honest", () => {
    render(<ChaptersPage />);

    expect(screen.getByText(/does not imply control over them/i)).toBeVisible();
    expect(
      screen.queryByText(
        /chapters worldwide|find your local chapter|chapter office/i,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /search|filter/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the chapter vision and global regions without administrative workflows", () => {
    render(<ChaptersPage />);

    expect(
      screen.getByRole("heading", { name: chaptersContent.definition.title }),
    ).toBeVisible();
    for (const region of chaptersContent.directory.areas) {
      expect(screen.getByText(region)).toBeVisible();
    }
    expect(
      screen.getByText(/does not represent an operating chapter/i),
    ).toBeVisible();
    expect(
      screen.queryByText(/planned|proposed|applications are not open/i),
    ).not.toBeInTheDocument();
  });

  it("keeps Tamil ID, roadmap, partner, and contact routes available", () => {
    render(<ChaptersPage />);

    for (const label of ["Join Tamil Ulagam"]) {
      for (const link of screen.getAllByRole("link", { name: label })) {
        expect(link).toHaveAttribute("href", "/join");
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
      fireEvent.click(screen.getByRole("button", { name: faq.title }));
      expect(screen.getByText(faq.description)).toBeVisible();
    }
  });
});
