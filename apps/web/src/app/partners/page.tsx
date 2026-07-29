import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages.partners;

export const metadata: Metadata = createPageMetadata(
  "Partners",
  content.description,
  "/partners",
);

export default function PartnersPage() {
  return <PublicPageShell content={content} />;
}
