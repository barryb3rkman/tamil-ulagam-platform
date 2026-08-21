import type { Metadata } from "next";

import { AuthCallbackPanel } from "@/components/application/auth-callback";
import { AuthShell } from "@/components/application/auth-shell";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Secure account link",
  "Complete a Tamil Ulagam account confirmation or password recovery request.",
  "/auth/callback",
);

export default function AuthCallbackPage() {
  return (
    <AuthShell
      eyebrow="Secure account access"
      title="Complete your account request"
      description="Confirm your account or complete a password recovery request through this protected return page."
    >
      <AuthCallbackPanel />
    </AuthShell>
  );
}
