import type { Metadata } from "next";

import { OrganisationRegistration } from "@/components/organisation/organisation-registration";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Review registration",
  "Review and submit a Tamil Ulagam organisation enrollment.",
  "/register/review",
);

/**
 * Legacy compatibility route. The V3 wizard folds Review into its own
 * stage 4 rather than a separate page/route, so this now mounts the
 * same orchestrator: a visitor who bookmarked this mid-flow resumes
 * exactly where their draft's own persisted step last left off (stage 4
 * if they had already reached review — updateCurrentStep persists that
 * — otherwise their real, earlier stage, never a broken partial view).
 */
export default function RegistrationReviewPage() {
  return <OrganisationRegistration />;
}
