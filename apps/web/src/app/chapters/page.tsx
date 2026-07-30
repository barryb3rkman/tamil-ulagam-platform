import type { Metadata } from "next";

import {
  ChapterDefinitionSection,
  ChapterFormationJourney,
  ChapterGovernanceSection,
  ChapterInterestSection,
  ChapterReadinessSection,
  ChapterRelationshipsSection,
  ChapterResponsibilitiesSection,
  ChapterStatusSection,
  ChaptersFaq,
  ChaptersFinalCta,
  ChaptersHero,
  GlobalLocalRelationshipSection,
  LocalValueSection,
  PlannedDirectorySection,
} from "@/components/chapters";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { chaptersContent } from "@/content/chapters";

export const metadata: Metadata = createPageMetadata(
  "Global Chapters | Tamil Ulagam",
  "Explore Tamil Ulagam’s planned global chapter model, including local community purpose, chapter formation, governance, status and responsible rollout.",
  "/chapters",
  images[chaptersContent.hero.imageKey],
);

export default function ChaptersPage() {
  return (
    <>
      <ChaptersHero />
      <ChapterDefinitionSection />
      <LocalValueSection />
      <GlobalLocalRelationshipSection />
      <ChapterFormationJourney />
      <ChapterResponsibilitiesSection />
      <ChapterGovernanceSection />
      <ChapterRelationshipsSection />
      <ChapterStatusSection />
      <PlannedDirectorySection />
      <ChapterReadinessSection />
      <ChapterInterestSection />
      <ChaptersFaq />
      <ChaptersFinalCta />
    </>
  );
}
