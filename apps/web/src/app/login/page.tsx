import type { Metadata } from "next";

import { LoginForm } from "@/components/application/auth-forms";
import { AuthShell } from "@/components/application/auth-shell";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Sign in",
  "Sign in to continue a Tamil Ulagam organisation enrollment.",
  "/login",
);

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Member access"
      title="Welcome back"
      description="Sign in to your Tamil Ulagam account to continue your organisation enrollment."
    >
      <LoginForm />
    </AuthShell>
  );
}
