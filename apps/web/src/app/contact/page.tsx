import type { Metadata } from "next";

import {
  ContactFaq,
  ContactFinalCta,
  ContactHero,
  ContactPrivacySection,
  ContactPurposeSection,
  ContactRoutingSection,
  EnquiryCategoriesSection,
  FutureContactModelSection,
  InformationBoundarySection,
  InformationToIncludeSection,
  InstitutionalEnquiriesSection,
  ResponseExpectationsSection,
  UrgentMattersSection,
} from "@/components/contact";
import { createPageMetadata } from "@/config/metadata";

export const metadata: Metadata = createPageMetadata(
  "Contact | Begin a Conversation with Tamil Ulagam",
  "Understand how to begin a future enquiry with Tamil Ulagam, including partnership, chapter, initiative, event, editorial, privacy and website-feedback pathways.",
  "/contact",
);

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactPurposeSection />
      <EnquiryCategoriesSection />
      <InformationToIncludeSection />
      <InformationBoundarySection />
      <ContactRoutingSection />
      <ContactPrivacySection />
      <ResponseExpectationsSection />
      <UrgentMattersSection />
      <InstitutionalEnquiriesSection />
      <FutureContactModelSection />
      <ContactFaq />
      <ContactFinalCta />
    </>
  );
}
