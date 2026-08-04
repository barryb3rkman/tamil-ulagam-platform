import type { Metadata } from "next";

import {
  TamilIdAccessSection,
  TamilIdCredentialPreview,
  TamilIdDefinition,
  TamilIdFaq,
  TamilIdFinalCta,
  TamilIdHero,
} from "@/components/tamil-id";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { tamilIdContent } from "@/content/tamil-id";

export const metadata: Metadata = createPageMetadata(
  "Tamil ID | Digital Membership for Tamil Ulagam",
  "Explore Tamil ID digital membership, including QR-enabled credentials, privacy principles and connected member access.",
  "/tamil-id",
  images[tamilIdContent.hero.imageKey],
);

export default function TamilIdPage() {
  return (
    <>
      <TamilIdHero />
      <TamilIdDefinition />
      <TamilIdCredentialPreview />
      <TamilIdAccessSection />
      <TamilIdFaq />
      <TamilIdFinalCta />
    </>
  );
}
