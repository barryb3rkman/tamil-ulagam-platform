import type { Metadata } from "next";

import {
  ChapterOrganisationEventsSection,
  EventCategoriesSection,
  EventLifecycleSection,
  EventPrivacySection,
  EventSafetySection,
  EventStatusSection,
  EventsDefinitionSection,
  EventsFaq,
  EventsFinalCta,
  EventsHero,
  EventsInterestSection,
  EventsReadinessSection,
  HybridArchiveSection,
  OrganiserModelSection,
  OrganiserPathwaySection,
  RegistrationAttendanceSection,
} from "@/components/events";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { eventsContent } from "@/content/events";

export const metadata: Metadata = createPageMetadata(
  "Events | Tamil Ulagam’s Planned Global Events Platform",
  "Explore Tamil Ulagam’s planned event platform, including organiser verification, publishing, registration, attendance, privacy, accessibility and responsible rollout.",
  "/events",
  images[eventsContent.hero.imageKey],
);

export default function EventsPage() {
  return (
    <>
      <EventsHero />
      <EventsDefinitionSection />
      <EventCategoriesSection />
      <OrganiserModelSection />
      <OrganiserPathwaySection />
      <EventLifecycleSection />
      <RegistrationAttendanceSection />
      <EventPrivacySection />
      <ChapterOrganisationEventsSection />
      <HybridArchiveSection />
      <EventStatusSection />
      <EventSafetySection />
      <EventsReadinessSection />
      <EventsInterestSection />
      <EventsFaq />
      <EventsFinalCta />
    </>
  );
}
