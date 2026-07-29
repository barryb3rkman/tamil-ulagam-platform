import type { Metadata } from "next";

import { PublicPageShell } from "@/components/public-page-shell";
import { createPageMetadata } from "@/config/metadata";
import { publicPages } from "@/content/pages";

const content = publicPages.events;

export const metadata: Metadata = createPageMetadata(
  "Events",
  content.description,
  "/events",
);

export default function EventsPage() {
  return <PublicPageShell content={content} />;
}
