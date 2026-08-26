import type { Metadata } from "next";

import { OrganisationRegistration } from "@/components/organisation/organisation-registration";
import { createApplicationMetadata } from "@/config/metadata";

export const metadata: Metadata = createApplicationMetadata(
  "Register an organisation",
  "Complete a Tamil Ulagam organisation enrollment.",
  "/register",
);

/**
 * Legacy compatibility route (D2 brief section 3/4): historical
 * links/bookmarks to /register must keep working. Rather than
 * maintaining a second UX implementation, this mounts the same V3
 * OrganisationRegistration used at /join/organisation — one
 * implementation, two entry points. /register keeps its existing
 * ApplicationShell portal chrome (register/layout.tsx); /join/organisation
 * stays on the public site chrome, matching /join/sangam and
 * /join/member. No server redirect/middleware — static export has
 * neither.
 */
export default function RegisterPage() {
  return <OrganisationRegistration />;
}
