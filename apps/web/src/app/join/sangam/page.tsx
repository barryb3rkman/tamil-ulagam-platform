import type { Metadata } from "next";

import { SangamRegistrationWizard } from "@/components/sangam/sangam-registration-wizard";
import { createPageMetadata } from "@/config/metadata";
import { joinImages } from "@/config/join-images";

export const metadata: Metadata = createPageMetadata(
  "Register a Tamil Sangam",
  "Register your Tamil Sangam with Tamil Ulagam — a short, federation-reviewed registration built for how Sangams actually operate.",
  "/join/sangam",
  joinImages.sangamJourneyHero,
);

export default function JoinSangamPage() {
  return <SangamRegistrationWizard />;
}
