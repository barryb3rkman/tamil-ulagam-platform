import type { Metadata } from "next";

import { createPageMetadata } from "@/config/metadata";
import { MemberJourneyPage } from "@/components/join/member-journey-page";

export const metadata: Metadata = createPageMetadata(
  "Join as a Member",
  "Member registration is in development. See how you'll join Tamil Ulagam through a registered organisation or Tamil Sangam.",
  "/join/member",
);

export default function JoinMemberPage() {
  return <MemberJourneyPage />;
}
