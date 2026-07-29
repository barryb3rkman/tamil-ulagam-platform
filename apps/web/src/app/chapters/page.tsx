import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages.chapters;

export const metadata: Metadata = createPageMetadata(
  "Chapters",
  content.description,
  "/chapters",
);

export default function ChaptersPage() {
  return <PublicPageShell content={content} />;
}
