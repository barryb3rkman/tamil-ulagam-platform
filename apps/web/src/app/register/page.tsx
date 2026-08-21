import type { Metadata } from "next";

import { RegistrationWizard } from "@/components/application/registration-wizard";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Register an organisation",
  "Complete a Tamil Ulagam organisation enrollment.",
  "/register",
);

export default function RegisterPage() {
  return <RegistrationWizard />;
}
