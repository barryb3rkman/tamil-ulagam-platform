import type { Metadata } from "next";

import { ManagementInvitations } from "@/components/member/management-invitations";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Management invitations",
  "Accept or decline invitations to manage an Organisation or Tamil Sangam.",
  "/workspace/invitations",
);

export default function WorkspaceInvitationsPage() {
  return <ManagementInvitations />;
}
