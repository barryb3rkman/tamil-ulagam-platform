import type { Metadata } from "next";

import { RegistrationReview } from "@/components/application/registration-review";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Review registration",
  "Review and submit a Tamil Ulagam organisation enrollment.",
  "/register/review",
);

export default function RegistrationReviewPage() {
  return <RegistrationReview />;
}
