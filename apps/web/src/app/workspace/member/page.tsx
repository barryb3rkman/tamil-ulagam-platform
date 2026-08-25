import type { Metadata } from "next";

import { MemberWorkspace } from "@/components/member/member-workspace";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Member Workspace",
  "Your Organisation and Tamil Sangam affiliations.",
  "/workspace/member",
);

export default function WorkspaceMemberPage() {
  return <MemberWorkspace />;
}
