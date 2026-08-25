import type { Metadata } from "next";

import { MemberRegistration } from "@/components/member/member-registration";
import { createPageMetadata } from "@/config/metadata";

export const metadata: Metadata = createPageMetadata(
  "Join as a Member",
  "Search verified Organisations and Tamil Sangams and request to join. Membership becomes active once the organisation approves your request.",
  "/join/member",
);

export default function JoinMemberPage() {
  return <MemberRegistration />;
}
