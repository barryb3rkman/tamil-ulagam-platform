import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal";
import { createPageMetadata } from "@/config/metadata";
import { privacyPolicy } from "@/content/legal";

const baseMetadata = createPageMetadata(
  privacyPolicy.metadataTitle,
  privacyPolicy.metadataDescription,
  "/privacy",
);

export const metadata: Metadata = {
  ...baseMetadata,
  title: { absolute: privacyPolicy.metadataTitle },
};

export default function PrivacyPage() {
  return <LegalDocument document={privacyPolicy} />;
}
