import type { Metadata } from "next";

import { OrganisationRegistration } from "@/components/organisation/organisation-registration";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Register an organisation",
  "Complete a Tamil Ulagam organisation enrollment.",
  "/register",
);

export default function RegisterPage() {
  return <OrganisationRegistration />;
}
