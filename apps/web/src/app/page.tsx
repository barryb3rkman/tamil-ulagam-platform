import type { Metadata } from "next";

import { CommunityStoriesPreview } from "@/components/home/community-stories-preview";
import { GlobalChaptersFeature } from "@/components/home/global-chapters-feature";
import { HomeFinalCta } from "@/components/home/home-final-cta";
import { HomeHero } from "@/components/home/home-hero";
import { InitiativesShowcase } from "@/components/home/initiatives-showcase";
import { MobilePlatformPreview } from "@/components/home/mobile-platform-preview";
import { PartnershipInvitation } from "@/components/home/partnership-invitation";
import { PillarsSection } from "@/components/home/pillars-section";
import { RoadmapPreview } from "@/components/home/roadmap-preview";
import { TamilIdFeature } from "@/components/home/tamil-id-feature";
import { VisionSignalStrip } from "@/components/home/vision-signal-strip";
import { WhyTamilUlagamSection } from "@/components/home/why-tamil-ulagam-section";
import { createPageMetadata } from "@/config/metadata";
import { homepageContent } from "@/content/homepage";

export const metadata: Metadata = createPageMetadata(
  homepageContent.hero.title,
  homepageContent.hero.description,
  "/",
);

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <VisionSignalStrip />
      <PillarsSection />
      <WhyTamilUlagamSection />
      <TamilIdFeature />
      <InitiativesShowcase />
      <GlobalChaptersFeature />
      <RoadmapPreview />
      <MobilePlatformPreview />
      <PartnershipInvitation />
      <CommunityStoriesPreview />
      <HomeFinalCta />
    </>
  );
}
