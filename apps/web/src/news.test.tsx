import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NewsPage from "@/app/news/page";
import { images, newsEditorialImageKeys } from "@/config/images";
import { newsContent } from "@/content/news";

describe("public News page", () => {
  it("renders one newsroom heading and the approved registry image", () => {
    render(<NewsPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      newsContent.hero.title,
    );
    expect(screen.getByText(newsContent.hero.caption)).toBeVisible();
    for (const key of newsEditorialImageKeys) {
      expect(screen.getByRole("img", { name: images[key].alt })).toBeVisible();
    }
  });

  it("keeps the newsroom honest without placeholder editorial records", () => {
    render(<NewsPage />);

    expect(screen.getByText(newsContent.definition.statement)).toBeVisible();
    expect(
      screen.queryByText(/breaking news|subscribe now|published today/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(
      screen.queryByText(/planned|proposed|in development|future newsroom/i),
    ).not.toBeInTheDocument();
  });

  it("renders PPT-aligned publication types and essential consent and correction principles", () => {
    render(<NewsPage />);

    for (const item of newsContent.publicationTypes.items) {
      expect(screen.getByRole("heading", { name: item.title })).toBeVisible();
    }
    for (const item of newsContent.communityStories.items) {
      expect(screen.getByText(item)).toBeVisible();
    }
    expect(screen.getByText(newsContent.corrections.statement)).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", {
        name: (accessibleName) =>
          accessibleName.includes(newsContent.corrections.title),
      }),
    );
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
      name: "Clear answers about Tamil Ulagam publishing.",
    }).parentElement?.parentElement;
    expect(faq).not.toBeNull();
    for (const item of newsContent.faqs) {
      const scope = within(faq as HTMLElement);
      expect(scope.getByText(item.title)).toBeVisible();
      fireEvent.click(scope.getByRole("button", { name: item.title }));
      expect(scope.getByText(item.description)).toBeVisible();
    }
  });
});
