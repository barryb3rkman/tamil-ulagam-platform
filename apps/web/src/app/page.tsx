import type { Metadata } from "next";

import { GlobalChaptersFeature } from "@/components/home/global-chapters-feature";
import { HomeFinalCta } from "@/components/home/home-final-cta";
import { HomeHero } from "@/components/home/home-hero";
import { InitiativesShowcase } from "@/components/home/initiatives-showcase";
import { PillarsSection } from "@/components/home/pillars-section";
import { VisionSignalStrip } from "@/components/home/vision-signal-strip";
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
      <InitiativesShowcase />
      <GlobalChaptersFeature />
      <HomeFinalCta />
    </>
  );
}
