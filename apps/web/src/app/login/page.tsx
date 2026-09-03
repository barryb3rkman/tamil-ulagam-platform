import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/application/auth-forms";
import { AuthJourneyShell } from "@/components/application/auth-journey-shell";
import { createApplicationMetadata } from "@/config/metadata";
import { RouteLoading } from "@/components/application/route-loading";

export const metadata: Metadata = createApplicationMetadata(
  "Sign in",
  "Sign in to access your Tamil Ulagam membership, Sangam or organisation workspace.",
  "/login",
);

export default function LoginPage() {
  return (
    <Suspense
      fallback={<RouteLoading label="Loading secure account access…" />}
    >
      <AuthJourneyShell mode="login">
        <LoginForm />
      </AuthJourneyShell>
    </Suspense>
  );
}
