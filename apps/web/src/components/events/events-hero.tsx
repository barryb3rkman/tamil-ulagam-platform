import { PublicPageHero } from "@/components/public-page-hero";
import { eventsContent } from "@/content/events";
import { AssemblyIllustration } from "@/components/illustration/brand-illustrations";

export function EventsHero() {
  const { hero } = eventsContent;

  return (
    <PublicPageHero
      figure={<AssemblyIllustration />}
      headingId="events-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      primaryAction={hero.primaryCallToAction}
      secondaryAction={hero.secondaryCallToAction}
    />
  );
}
