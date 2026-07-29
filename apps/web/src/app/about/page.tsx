import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages.about;

export const metadata: Metadata = createPageMetadata(
  "About",
  content.description,
  "/about",
);

export default function AboutPage() {
  return <PublicPageShell content={content} />;
}
