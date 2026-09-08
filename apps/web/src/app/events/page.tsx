import type { Metadata } from "next";

import {
  ChapterFormats,
  EventsFinalCta,
  EventsHero,
  SignatureCalendar,
  TamilMonthRibbon,
} from "@/components/events";
import { images } from "@/config/images";
import { createPageMetadata } from "@/config/metadata";
import { eventsContent } from "@/content/events";

export const metadata: Metadata = createPageMetadata(
  "Events | Tamil Ulagam Global Events",
  "Tamil Ulagam Day, Pongal, Tamil New Year, the Global Tamil Summit, Heritage Month and Awards Night — carried by every chapter.",
  "/events",
  images[eventsContent.hero.imageKey],
);

export default function EventsPage() {
  return (
    <>
      <EventsHero />
      <SignatureCalendar />
      <TamilMonthRibbon />
      <ChapterFormats />
      <EventsFinalCta />
    </>
  );
}
