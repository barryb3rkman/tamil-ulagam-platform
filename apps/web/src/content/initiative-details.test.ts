import { describe, expect, it } from "vitest";

import { images } from "@/config/images";
import {
  getInitiativeDetailIdentity,
  initiativeDetailSlugs,
  initiativeDetails,
} from "@/content/initiative-details";
import { initiatives } from "@/content/initiatives";

describe("initiative detail content", () => {
  it("maps every approved initiative to one complete detail entry", () => {
    expect(initiativeDetailSlugs).toHaveLength(8);
    expect(new Set(initiativeDetailSlugs).size).toBe(
      initiativeDetailSlugs.length,
    );
    expect(new Set(initiatives.map((entry) => entry.href)).size).toBe(
      initiatives.length,
    );
    expect(new Set(initiatives.map((entry) => entry.imageKey)).size).toBe(
      initiatives.length,
    );

    for (const slug of initiativeDetailSlugs) {
      const detail = initiativeDetails[slug];
      const initiative = getInitiativeDetailIdentity(slug);

      expect(detail.slug).toBe(slug);
      expect(initiative.status).toBeDefined();
      expect(detail.intendedAudiences.length).toBeGreaterThan(0);
      expect(detail.capabilities.length).toBeGreaterThan(0);
      expect(detail.readinessRequirements.length).toBeGreaterThan(0);
      expect(detail.developmentPath).toHaveLength(4);
      expect(detail.related).toHaveLength(3);
      expect(detail.whyThisMatters.heading.trim()).not.toBe("");
      expect(detail.whyThisMatters.statement.trim()).not.toBe("");
      expect(detail.audienceHeading.trim()).not.toBe("");
      expect(detail.readinessHeading.trim()).not.toBe("");
      expect(detail.participationHeading.trim()).not.toBe("");
      expect(detail.finalCtaHeading.trim()).not.toBe("");
      expect(images[initiative.imageKey as keyof typeof images]).toBeDefined();
      expect(detail.primaryCallToAction.href).toBe("#capabilities");
    }
  });

  it("keeps relationships, sequence, and planned-service language honest", () => {
    const sequence = initiatives.map((entry) => entry.slug);
    expect(sequence).toEqual(initiativeDetailSlugs);

    for (const detail of Object.values(initiativeDetails)) {
      const relatedSlugs = detail.related.map((entry) => entry.slug);
      const content = JSON.stringify(detail).toLowerCase();

      expect(new Set(relatedSlugs).size).toBe(relatedSlugs.length);
      expect(relatedSlugs).not.toContain(detail.slug);
      for (const relatedSlug of relatedSlugs) {
        expect(initiativeDetailSlugs).toContain(relatedSlug);
      }
      expect(content).toMatch(/planned|future|proposed|intended|introduced/);
      expect(content).not.toMatch(
        /book now|apply now|enrol now|register for the summit|available worldwide|serving thousands|trusted by leading organisations/,
      );
      expect(content).not.toMatch(/\b\d{3,}\b/);
    }
  });

  it("keeps editorial headings unique and initiative-specific", () => {
    const headingSets = Object.values(initiativeDetails).map((detail) => [
      detail.whyThisMatters.heading,
      detail.audienceHeading,
      detail.readinessHeading,
      detail.participationHeading,
      detail.finalCtaHeading,
    ]);

    expect(
      new Set(
        Object.values(initiativeDetails).map(
          (detail) => detail.whyThisMatters.heading,
        ),
      ).size,
    ).toBe(initiativeDetailSlugs.length);
    expect(
      new Set(headingSets.map((headings) => headings.join("|"))).size,
    ).toBe(initiativeDetailSlugs.length);

    for (const [slug, detail] of Object.entries(initiativeDetails)) {
      if (slug !== "healthcare") {
        expect(detail.whyThisMatters.heading).not.toContain(
          "care at its centre",
        );
      }
    }
  });

  it("contains only complete, sequential capability entries", () => {
    for (const detail of Object.values(initiativeDetails)) {
      const titles = detail.capabilities.map((capability) => capability.title);

      expect(new Set(titles).size).toBe(titles.length);
      for (const capability of detail.capabilities) {
        expect(capability.title.trim()).not.toBe("");
        expect(capability.description.trim()).not.toBe("");
        expect(Object.keys(capability).sort()).toEqual([
          "description",
          "title",
        ]);
      }
    }
  });
});
