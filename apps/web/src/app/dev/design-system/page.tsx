import type { Metadata } from "next";

import { DesignSystemShowcase } from "@/components/design-system/design-system-showcase";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Design system",
  "Internal Tamil Ulagam design-system showcase for visual QA and engineering review.",
  "/dev/design-system",
);

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
