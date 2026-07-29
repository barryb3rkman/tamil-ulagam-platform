import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages.news;

export const metadata: Metadata = createPageMetadata(
  "News",
  content.description,
  "/news",
);

export default function NewsPage() {
  return <PublicPageShell content={content} />;
}
