import type { Metadata } from "next";

import {
  CollaborationModelsSection,
  PartnerCategoriesSection,
  PartnersFaq,
  PartnersFinalCta,
  PartnersHero,
  PartnershipBoundariesSection,
  PartnershipDefinitionSection,
  PartnershipInterestSection,
} from "@/components/partners";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { partnersContent } from "@/content/partners";

export const metadata: Metadata = createPageMetadata(
  "Partners | Responsible Collaboration with Tamil Ulagam",
  "Explore Tamil Ulagam’s future collaboration vision across institutions, universities, Tamil associations, corporate organisations, technology and media.",
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
      <PartnershipInterestSection />
      <PartnersFaq />
      <PartnersFinalCta />
    </>
  );
}
