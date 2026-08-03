import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal";
import { createPageMetadata } from "@/config/metadata";
import { termsOfUse } from "@/content/legal";

const baseMetadata = createPageMetadata(
  termsOfUse.metadataTitle,
  termsOfUse.metadataDescription,
  "/terms",
);

export const metadata: Metadata = {
  ...baseMetadata,
  title: { absolute: termsOfUse.metadataTitle },
};

export default function TermsPage() {
  return <LegalDocument document={termsOfUse} />;
}
