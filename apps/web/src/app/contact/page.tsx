import type { Metadata } from "next";

import {
  ContactFaq,
  ContactFinalCta,
  ContactHero,
  ContactPurposeSection,
  EnquiryCategoriesSection,
} from "@/components/contact";
import { createPageMetadata } from "@/config/metadata";

export const metadata: Metadata = createPageMetadata(
  "Contact | Begin a Conversation with Tamil Ulagam",
  "Understand how to begin an enquiry with Tamil Ulagam across partnership, chapter, initiative, event, editorial, privacy and website-feedback pathways.",
  "/contact",
);

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactPurposeSection />
      <EnquiryCategoriesSection />
      <ContactFaq />
      <ContactFinalCta />
    </>
  );
}
