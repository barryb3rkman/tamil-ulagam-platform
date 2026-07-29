import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages["tamil-id"];

export const metadata: Metadata = createPageMetadata(
  "Tamil ID",
  content.description,
  "/tamil-id",
);

export default function TamilIdPage() {
  return <PublicPageShell content={content} />;
}
