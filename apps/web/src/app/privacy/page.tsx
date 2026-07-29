import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages.privacy;

export const metadata: Metadata = createPageMetadata(
  "Privacy",
  content.description,
  "/privacy",
);

export default function PrivacyPage() {
  return <PublicPageShell content={content} />;
}
