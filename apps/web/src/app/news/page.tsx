import type { Metadata } from "next";

import {
  CommunityStoriesSection,
  CorrectionsSection,
  MultilingualAccessibilitySection,
  NewsFaq,
  NewsFinalCta,
  NewsHero,
  NewsInterestSection,
  NewsroomDefinitionSection,
  PublicationTypesSection,
} from "@/components/news";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { newsContent } from "@/content/news";

export const metadata: Metadata = createPageMetadata(
  "News | Tamil Ulagam’s Planned Public Editorial Platform",
  "Explore Tamil Ulagam’s planned space for community news, announcements, diaspora updates and Tamil and English cultural and institutional stories.",
  "/news",
  images[newsContent.hero.imageKey],
);

export default function NewsPage() {
  return (
    <>
      <NewsHero />
      <NewsroomDefinitionSection />
      <PublicationTypesSection />
      <CommunityStoriesSection />
      <CorrectionsSection />
      <MultilingualAccessibilitySection />
      <NewsInterestSection />
      <NewsFaq />
      <NewsFinalCta />
    </>
  );
}
