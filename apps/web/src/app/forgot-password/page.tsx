import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/application/auth-forms";
import { AuthShell } from "@/components/application/auth-shell";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Reset password",
  "Request password recovery for a Tamil Ulagam account.",
  "/forgot-password",
);

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Request a reset link for the email connected to your Tamil Ulagam account."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
