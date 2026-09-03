import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InitiativeDetailPage } from "@/components/initiatives/detail";
import { images } from "@/config/images";
import {
  getInitiativeDetailIdentity,
  getInitiativeImageKey,
  initiativeDetailSlugs,
  initiativeDetails,
  type InitiativeDetail,
} from "@/content/initiative-details";
import { initiatives } from "@/content/initiatives";

describe("initiative detail pages", () => {
  it("renders the shared detail foundation for every approved initiative", () => {
    for (const slug of initiativeDetailSlugs) {
      const detail: InitiativeDetail = initiativeDetails[slug];
      const initiative = getInitiativeDetailIdentity(slug);
      const currentIndex = initiatives.findIndex(
        (entry) => entry.slug === slug,
      );
      const view = render(<InitiativeDetailPage detail={detail} />);

      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        initiative.title,
      );
      expect(
        screen.getByRole("navigation", { name: "Breadcrumb" }),
      ).toBeVisible();
      expect(
        screen.getByRole("img", {
          name: images[getInitiativeImageKey(slug)].alt,
        }),
      ).toHaveAttribute("loading", "eager");
      expect(
        screen.getByRole("heading", {
          name: "Connected capabilities shaped around trust and community value.",
        }),
      ).toBeVisible();
      expect(
        screen.queryByText(/planned|proposed|in development/i),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          name: detail.audienceHeading,
        }),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", {
          name: detail.whyThisMatters.heading,
        }),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", {
          name: detail.participationHeading,
        }),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", {
          name: detail.finalCtaHeading,
        }),
      ).toBeVisible();
      expect(
        screen.queryByRole("heading", {
          name: "A responsible route from purpose to participation.",
        }),
      ).not.toBeInTheDocument();
      if (detail.safetyNotice) {
        expect(screen.getByText(detail.safetyNotice)).toBeVisible();
      }
      expect(
        screen.getByRole("link", { name: "Explore partnership" }),
      ).toHaveAttribute("href", "/partners");

      const capabilityItems = within(
        screen.getByRole("list", { name: "Capability list" }),
      ).getAllByRole("listitem");
      expect(capabilityItems).toHaveLength(detail.capabilities.length);
      capabilityItems.forEach((item, index) => {
        expect(item).toHaveTextContent(`0${index + 1}`);
        expect(item.textContent?.trim()).not.toBe("");
      });

      const relatedSection = screen.getByRole("region", {
        name: "Related initiatives",
      });
      expect(within(relatedSection).getAllByRole("listitem")).toHaveLength(3);

      if (currentIndex > 0) {
        expect(
          screen.getByRole("link", { name: /Previous initiative:/ }),
        ).toHaveAttribute("href", initiatives[currentIndex - 1]!.href);
      }
      if (currentIndex < initiatives.length - 1) {
        expect(
          screen.getByRole("link", { name: /Next initiative:/ }),
        ).toHaveAttribute("href", initiatives[currentIndex + 1]!.href);
      }

      view.unmount();
    }
  });
});
