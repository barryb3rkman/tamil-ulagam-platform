import type { Metadata } from "next";

import {
  ChangeAndTransparencySection,
  CurrentFoundationSection,
  DependencySection,
  PlatformLayersSection,
  QualityPrinciplesSection,
  ReadinessGatesSection,
  RoadmapFaq,
  RoadmapFinalCta,
  RoadmapHero,
  RoadmapParticipationSection,
  RoadmapPhaseSequence,
  RoadmapPrinciples,
} from "@/components/roadmap";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { roadmapPageContent } from "@/content/roadmap-page";

export const metadata: Metadata = createPageMetadata(
  "Roadmap | Building Tamil Ulagam in Responsible Stages",
  "Explore Tamil Ulagam’s staged development roadmap across the public foundation, membership, Tamil ID, chapters, initiatives, mobile access and responsible global expansion.",
  "/roadmap",
  images[roadmapPageContent.hero.imageKey],
);

export default function RoadmapPage() {
  return (
    <>
      <RoadmapHero />
      <RoadmapPrinciples />
      <CurrentFoundationSection />
      <RoadmapPhaseSequence />
      <DependencySection />
      <PlatformLayersSection />
      <ReadinessGatesSection />
      <QualityPrinciplesSection />
      <ChangeAndTransparencySection />
      <RoadmapParticipationSection />
      <RoadmapFaq />
      <RoadmapFinalCta />
    </>
  );
}
