import type { Metadata } from "next";

import {
  EventCategoriesSection,
  EventsDefinitionSection,
  EventsFaq,
  EventsFinalCta,
  EventsHero,
  EventsInterestSection,
} from "@/components/events";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { eventsContent } from "@/content/events";

export const metadata: Metadata = createPageMetadata(
  "Events | Tamil Ulagam’s Planned Global Events Platform",
  "Explore proposed Tamil Ulagam celebrations including Tamil Ulagam Day, Pongal, Tamil New Year, a Global Tamil Summit, Heritage Month and Awards Night.",
  "/events",
  images[eventsContent.hero.imageKey],
);

export default function EventsPage() {
  return (
    <>
      <EventsHero />
      <EventsDefinitionSection />
      <EventCategoriesSection />
      <EventsInterestSection />
      <EventsFaq />
      <EventsFinalCta />
    </>
  );
}
