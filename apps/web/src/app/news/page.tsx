import type { Metadata } from "next";

import {
  AuthorshipSection,
  CommunityStoriesSection,
  ContentStatusSection,
  CorrectionsSection,
  DistributionSection,
  EditorialDistinctionsSection,
  EditorialPrinciplesSection,
  FutureDiscoverySection,
  MultilingualAccessibilitySection,
  NewsFaq,
  NewsFinalCta,
  NewsHero,
  NewsInterestSection,
  NewsroomDefinitionSection,
  NewsroomReadinessSection,
  PublicationTypesSection,
  PublishingWorkflowSection,
  SourceVerificationSection,
} from "@/components/news";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { newsContent } from "@/content/news";

export const metadata: Metadata = createPageMetadata(
  "News | Tamil Ulagam’s Planned Public Editorial Platform",
  "Explore Tamil Ulagam’s planned newsroom model for verified announcements, community stories, knowledge, corrections, multilingual publishing and responsible public communication.",
  "/news",
  images[newsContent.hero.imageKey],
);

export default function NewsPage() {
  return (
    <>
      <NewsHero />
      <NewsroomDefinitionSection />
      <PublicationTypesSection />
      <EditorialDistinctionsSection />
      <EditorialPrinciplesSection />
      <PublishingWorkflowSection />
      <SourceVerificationSection />
      <AuthorshipSection />
      <CommunityStoriesSection />
      <CorrectionsSection />
      <MultilingualAccessibilitySection />
      <FutureDiscoverySection />
      <DistributionSection />
      <ContentStatusSection />
      <NewsroomReadinessSection />
      <NewsInterestSection />
      <NewsFaq />
      <NewsFinalCta />
    </>
  );
}
