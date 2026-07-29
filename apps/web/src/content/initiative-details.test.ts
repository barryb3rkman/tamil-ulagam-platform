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
});
