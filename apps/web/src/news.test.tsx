import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import NewsPage from "@/app/news/page";
import { images, newsEditorialImageKeys } from "@/config/images";
import { newsContent } from "@/content/news";

afterEach(() => cleanup());

describe("public News page", () => {
  it("renders one planned-newsroom heading and the approved registry image", () => {
    render(<NewsPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      newsContent.hero.title,
    );
    expect(screen.getByText(newsContent.hero.status)).toBeVisible();
    expect(screen.getByText(newsContent.hero.caption)).toBeVisible();
    for (const key of newsEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("keeps the future newsroom honest without placeholder editorial records", () => {
    render(<NewsPage />);

    expect(screen.getByText(newsContent.definition.statement)).toBeVisible();
    expect(screen.getByText(newsContent.interest.notice)).toBeVisible();
    expect(
      screen.getByText(
        "No approved public article collection is being presented on this page yet.",
      ),
    ).toBeVisible();
    expect(
      screen.queryByText(/breaking news|subscribe now|published today/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("renders PPT-aligned publication types and essential consent and correction principles", () => {
    render(<NewsPage />);

    for (const item of newsContent.publicationTypes.items) {
      expect(screen.getByRole("heading", { name: item.title })).toBeVisible();
    }
    for (const item of newsContent.communityStories.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    for (const category of newsContent.corrections.categories) {
      expect(screen.getByText(category.title)).toBeVisible();
    }
  });

  it("renders multilingual foundations with honest routes", () => {
    render(<NewsPage />);

    for (const group of newsContent.multilingualAccessibility.groups) {
      expect(screen.getByRole("heading", { name: group.title })).toBeVisible();
    }
    for (const link of screen.getAllByRole("link", {
      name: "Explore Partnerships",
    })) {
      expect(link).toHaveAttribute("href", "/partners");
    }
    for (const link of screen.getAllByRole("link", {
      name: "Contact Tamil Ulagam",
    })) {
      expect(link).toHaveAttribute("href", "/contact");
    }
    expect(
      screen.getByRole("link", { name: "Learn About Tamil Ulagam" }),
    ).toHaveAttribute("href", "/about");

    const faq = screen.getByRole("heading", {
      name: "Clear answers for a planned public newsroom.",
    }).parentElement?.parentElement;
    expect(faq).not.toBeNull();
    for (const item of newsContent.faqs) {
      expect(within(faq as HTMLElement).getByText(item.title)).toBeVisible();
      expect(
        within(faq as HTMLElement).getByText(item.description),
      ).toBeVisible();
    }
  });
});
