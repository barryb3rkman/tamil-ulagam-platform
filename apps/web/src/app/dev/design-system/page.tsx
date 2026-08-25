import type { Metadata } from "next";

import { DesignSystemShowcase } from "@/components/design-system/design-system-showcase";
import { createApplicationMetadata } from "@/config/metadata";

// Development/QA surface only — not a public navigation destination.
// `createApplicationMetadata` sets `robots: { index: false, follow: false }`
// (the same helper every portal/admin page already uses), and
// `robots.ts` additionally disallows the `/dev/` path outright. Nothing
// in the app links here; reach it by typing the URL directly.
export const metadata: Metadata = createApplicationMetadata(
  "Design system",
  "Internal Tamil Ulagam design-system showcase for visual QA and engineering review.",
  "/dev/design-system",
);

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
