import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages.terms;

export const metadata: Metadata = createPageMetadata(
  "Terms",
  content.description,
  "/terms",
);

export default function TermsPage() {
  return <PublicPageShell content={content} />;
}
