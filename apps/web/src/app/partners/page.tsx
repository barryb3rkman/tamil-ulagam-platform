import type { Metadata } from "next";

import {
  CollaborationModelsSection,
  DueDiligenceSection,
  GovernanceAndAccessSection,
  InitiativeCollaborationSection,
  PartnerCategoriesSection,
  PartnersFaq,
  PartnersFinalCta,
  PartnersHero,
  PartnershipBoundariesSection,
  PartnershipDefinitionSection,
  PartnershipInterestSection,
  PartnershipPathwaySection,
  PartnershipReadinessSection,
  PartnershipStatusSection,
} from "@/components/partners";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { partnersContent } from "@/content/partners";

export const metadata: Metadata = createPageMetadata(
  "Partners | Responsible Collaboration with Tamil Ulagam",
  "Explore Tamil Ulagam’s partnership vision, including collaboration models, due diligence, governance, data boundaries and responsible engagement.",
  "/partners",
  images[partnersContent.hero.imageKey],
);

export default function PartnersPage() {
  return (
    <>
      <PartnersHero />
      <PartnershipDefinitionSection />
      <PartnerCategoriesSection />
      <CollaborationModelsSection />
      <PartnershipBoundariesSection />
      <PartnershipPathwaySection />
      <DueDiligenceSection />
      <GovernanceAndAccessSection />
      <PartnershipStatusSection />
      <InitiativeCollaborationSection />
      <PartnershipReadinessSection />
      <PartnershipInterestSection />
      <PartnersFaq />
      <PartnersFinalCta />
    </>
  );
}
