import type { Metadata } from "next";

import { OrganisationRegistration } from "@/components/organisation/organisation-registration";
import { createPageMetadata } from "@/config/metadata";
import { joinImages } from "@/config/join-images";

export const metadata: Metadata = createPageMetadata(
  "Register an Organisation",
  "Register your organisation with Tamil Ulagam — a short, federation-reviewed registration for education, healthcare, business, nonprofit and community organisations.",
  "/join/organisation",
  joinImages.organisationJourneyHero,
);

export default function JoinOrganisationPage() {
  return <OrganisationRegistration />;
}
