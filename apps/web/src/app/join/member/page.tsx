import type { Metadata } from "next";

import { MemberRegistration } from "@/components/member/member-registration";
import { createPageMetadata } from "@/config/metadata";

export const metadata: Metadata = createPageMetadata(
  "Connect Your Membership",
  "Find the Tamil Sangam or Organisation you already belong to and submit an affiliation claim. Your membership becomes active once they confirm it.",
  "/join/member",
);

export default function JoinMemberPage() {
  return <MemberRegistration />;
}
