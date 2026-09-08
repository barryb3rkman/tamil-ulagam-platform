import type { Metadata } from "next";

import {
  ClassicalLine,
  LatestHeadlines,
  NewsFinalCta,
  NewsHero,
  NewsPrinciples,
  NewsStreams,
} from "@/components/news";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { newsContent } from "@/content/news";

export const metadata: Metadata = createPageMetadata(
  "News | Tamil Ulagam Newsroom",
  "Federation notices, reporting from the chapters, and the Tamil language and heritage desk.",
  "/news",
  images[newsContent.hero.imageKey],
);

export default function NewsPage() {
  return (
    <>
      <NewsHero />
      <LatestHeadlines />
      <NewsStreams />
      <ClassicalLine />
      <NewsPrinciples />
      <NewsFinalCta />
    </>
  );
}
