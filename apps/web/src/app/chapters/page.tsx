import type { Metadata } from "next";

import {
  ChapterDefinitionSection,
  ChapterInterestSection,
  ChaptersFaq,
  ChaptersFinalCta,
  ChaptersHero,
  LocalValueSection,
  PlannedDirectorySection,
} from "@/components/chapters";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { chaptersContent } from "@/content/chapters";

export const metadata: Metadata = createPageMetadata(
  "Global Chapters | Tamil Ulagam",
  "Explore Tamil Ulagam’s proposed global chapter network, planned regions and vision for connecting local communities through one global federation.",
  "/chapters",
  images[chaptersContent.hero.imageKey],
);

export default function ChaptersPage() {
  return (
    <>
      <ChaptersHero />
      <ChapterDefinitionSection />
      <LocalValueSection />
      <PlannedDirectorySection />
      <ChapterInterestSection />
      <ChaptersFaq />
      <ChaptersFinalCta />
    </>
  );
}
