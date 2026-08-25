import type { Metadata } from "next";

import { JoinExperience } from "@/components/join";
import { joinImages } from "@/config/join-images";
import { createPageMetadata } from "@/config/metadata";

export const metadata: Metadata = createPageMetadata(
  "Join Tamil Ulagam",
  "Register an organisation, establish your Tamil Sangam, join as a member, or explore a partnership with Tamil Ulagam Global Federation.",
  "/join",
  joinImages.joinHubHero,
);

export default function JoinPage() {
  return <JoinExperience />;
}
