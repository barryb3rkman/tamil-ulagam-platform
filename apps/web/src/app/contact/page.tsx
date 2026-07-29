import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages.contact;

export const metadata: Metadata = createPageMetadata(
  "Contact",
  content.description,
  "/contact",
);

export default function ContactPage() {
  return <PublicPageShell content={content} />;
}
