import type { Metadata } from "next";

import {
  ChapterDefinitionSection,
  ChapterInterestSection,
  ChaptersFaq,
  ChaptersFinalCta,
  ChaptersHero,
  LocalValueSection,
  ChapterRegionsSection,
} from "@/components/chapters";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { chaptersContent } from "@/content/chapters";

export const metadata: Metadata = createPageMetadata(
  "Global Chapters | Tamil Ulagam",
  "Explore Tamil Ulagam’s global chapter network and vision for connecting local communities through one shared federation.",
  "/chapters",
  images[chaptersContent.hero.imageKey],
);

export default function ChaptersPage() {
  return (
    <>
      <ChaptersHero />
      <ChapterDefinitionSection />
      <LocalValueSection />
      <ChapterRegionsSection />
      <ChapterInterestSection />
      <ChaptersFaq />
      <ChaptersFinalCta />
    </>
  );
}
