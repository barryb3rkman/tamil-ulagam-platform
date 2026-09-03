import type { Metadata } from "next";
import { Suspense } from "react";

import { SignupForm } from "@/components/application/auth-forms";
import { AuthJourneyShell } from "@/components/application/auth-journey-shell";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Create account",
  "Create one Tamil Ulagam account for membership, Sangam and organisation journeys.",
  "/signup",
);

export default function SignupPage() {
  return (
    <Suspense
      fallback={<RouteLoading label="Loading secure account access…" />}
    >
      <AuthJourneyShell mode="signup">
        <SignupForm />
      </AuthJourneyShell>
    </Suspense>
  );
}
