import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NewsPage from "@/app/news/page";
import { images, newsEditorialImageKeys } from "@/config/images";
import { newsContent } from "@/content/news";

describe("public News page", () => {
  it("renders one newsroom heading and every approved image", () => {
    render(<NewsPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      newsContent.hero.title,
    );
    for (const key of newsEditorialImageKeys) {
      expect(
        screen.getAllByRole("img", { name: images[key].alt })[0],
      ).toBeVisible();
    }
  });

  it("names the three desks in both languages, with what each carries", () => {
    render(<NewsPage />);

    for (const stream of newsContent.streams) {
      expect(
        screen.getByRole("heading", { level: 3, name: stream.title }),
      ).toBeVisible();
      expect(screen.getAllByText(stream.tamilTitle)[0]).toBeVisible();
      for (const topic of stream.topics) {
        expect(screen.getAllByText(topic)[0]).toBeVisible();
      }
    }
  });

  it("shows a classical line with its source attributed", () => {
    render(<NewsPage />);

    const first = newsContent.classicalLines[0];
    expect(first).toBeDefined();
    if (!first) return;
    expect(screen.getByText(first.english)).toBeVisible();
    // Public-domain verse still gets its poet named; that is the whole point
    // of quoting it rather than paraphrasing.
    expect(screen.getByText(first.source)).toBeVisible();
  });

  it("publishes no byline it cannot stand behind, and dates none of its own copy", () => {
    const { container } = render(<NewsPage />);

    // Third-party headlines carry their publisher's dateline and are quoted
    // verbatim; everything the federation writes itself stays undated.
    const ourCopy = container.cloneNode(true) as HTMLElement;
    for (const quoted of ourCopy.querySelectorAll(
      "[data-external-headlines]",
    )) {
      quoted.remove();
    }
    expect(ourCopy.textContent).not.toMatch(/\b(?:19|20)\d{2}\b/);
    expect(screen.queryByText(/^by\s+/i)).not.toBeInTheDocument();
  });
});
