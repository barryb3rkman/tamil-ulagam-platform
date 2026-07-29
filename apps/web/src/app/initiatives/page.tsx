import type { Metadata } from "next";

import {
  EcosystemGroups,
  EcosystemIntroduction,
  HumanDevelopmentSection,
  InitiativesDirectory,
  InitiativesHero,
  KnowledgeCultureSection,
  OpportunityEconomySection,
  ParticipationCta,
  ReadinessPrinciplesSection,
  SharedPlatformSection,
} from "@/components/initiatives";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";

const description =
  "Explore Tamil Ulagam’s long-term initiatives across healthcare, education, business, careers, research, tourism, arts and global events.";

export const metadata: Metadata = createPageMetadata(
  "Initiatives",
  description,
  "/initiatives",
  images.initiativeResearch,
);

export default function InitiativesPage() {
  return (
    <>
      <InitiativesHero />
      <EcosystemIntroduction />
      <EcosystemGroups />
      <HumanDevelopmentSection />
      <OpportunityEconomySection />
      <KnowledgeCultureSection />
      <SharedPlatformSection />
      <ReadinessPrinciplesSection />
      <InitiativesDirectory />
      <ParticipationCta />
    </>
  );
}
