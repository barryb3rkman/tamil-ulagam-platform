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
  "Tamil ID | Planned Digital Membership for Tamil Ulagam",
  "Explore the planned Tamil ID digital membership concept, including future verification, privacy principles, member access and responsible rollout.",
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
