import type { Metadata } from "next";

import { SignupForm } from "@/components/application/auth-forms";
import { AuthShell } from "@/components/application/auth-shell";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Create account",
  "Create a Tamil Ulagam account before registering an organisation.",
  "/signup",
);

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Organisation enrollment"
      title="Create your account"
      description="Register and represent your organisation through a personal Tamil Ulagam account."
    >
      <SignupForm />
    </AuthShell>
  );
}
