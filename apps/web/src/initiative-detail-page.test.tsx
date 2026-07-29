import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InitiativeDetailPage } from "@/components/initiatives/detail";
import { images } from "@/config/images";
import {
  getInitiativeDetailIdentity,
  getInitiativeImageKey,
  initiativeDetailSlugs,
  initiativeDetails,
} from "@/content/initiative-details";
import { initiatives } from "@/content/initiatives";

afterEach(() => cleanup());

describe("initiative detail pages", () => {
  it("renders the shared detail foundation for every approved initiative", () => {
    for (const slug of initiativeDetailSlugs) {
      const detail = initiativeDetails[slug];
      const initiative = getInitiativeDetailIdentity(slug);
      const currentIndex = initiatives.findIndex(
        (entry) => entry.slug === slug,
      );
      const view = render(<InitiativeDetailPage detail={detail} />);

      expect(view.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(view.getByRole("heading", { level: 1 })).toHaveTextContent(
        initiative.title,
      );
      expect(
        view.getByRole("navigation", { name: "Breadcrumb" }),
      ).toBeVisible();
      expect(
        view.getByRole("img", {
          name: images[getInitiativeImageKey(slug)].alt,
        }),
      ).toHaveAttribute("loading", "eager");
      expect(view.getAllByText("Planned").length).toBeGreaterThan(0);
      expect(
        view.getByRole("heading", {
          name: "Planned capabilities, introduced in stages.",
        }),
      ).toBeVisible();
      expect(
        view.getByRole("heading", {
          name: "Built around real community roles.",
        }),
      ).toBeVisible();
      expect(
        view.getByRole("heading", {
          name: "Useful only when it is responsible.",
        }),
      ).toBeVisible();
      expect(
        view.getByRole("heading", {
          name: "A responsible route from purpose to participation.",
        }),
      ).toBeVisible();
      expect(
        view.getByRole("link", { name: "Explore partnership" }),
      ).toHaveAttribute("href", "/partners");

      const relatedSection = view.getByRole("region", {
        name: "Related initiatives",
      });
      expect(within(relatedSection).getAllByRole("listitem")).toHaveLength(3);

      if (currentIndex > 0) {
        expect(
          view.getByRole("link", { name: /Previous initiative:/ }),
        ).toHaveAttribute("href", initiatives[currentIndex - 1]!.href);
      }
      if (currentIndex < initiatives.length - 1) {
        expect(
          view.getByRole("link", { name: /Next initiative:/ }),
        ).toHaveAttribute("href", initiatives[currentIndex + 1]!.href);
      }

      view.unmount();
    }
  });
});
