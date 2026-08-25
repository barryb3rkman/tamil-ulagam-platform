import type { Metadata } from "next";

import { createPageMetadata } from "@/config/metadata";
import { SangamJourneyPage } from "@/components/join/sangam-journey-page";
import { joinImages } from "@/config/join-images";

export const metadata: Metadata = createPageMetadata(
  "Register a Tamil Sangam",
  "Tamil Sangam registration is in development. See how your Sangam will establish its presence within Tamil Ulagam.",
  "/join/sangam",
  joinImages.sangamJourneyHero,
);

export default function JoinSangamPage() {
  return <SangamJourneyPage />;
}
