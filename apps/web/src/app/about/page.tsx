import type { Metadata } from "next";

import {
  AboutFinalCta,
  AboutHero,
  AboutManifesto,
  CoreObjectivesSection,
  CulturalStatementSection,
  EcosystemSection,
  GlobalChallengeSection,
  RoadmapSection,
  VisionMissionSection,
} from "@/components/about";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";

export const metadata: Metadata = createPageMetadata(
  "About Tamil Ulagam",
  "Learn why Tamil Ulagam is being built as a trusted global digital bridge for Tamil identity, culture, community and opportunity.",
  "/about",
  images.aboutHero,
);

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutManifesto />
      <VisionMissionSection />
      <GlobalChallengeSection />
      <CoreObjectivesSection />
      <EcosystemSection />
      <RoadmapSection />
      <CulturalStatementSection />
      <AboutFinalCta />
    </>
  );
}
