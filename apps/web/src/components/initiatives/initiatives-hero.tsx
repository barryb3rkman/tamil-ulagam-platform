import { PublicPageHero } from "@/components/public-page-hero";
import { initiativeOverviewContent } from "@/content/initiatives-overview";
import { AscentIllustration } from "@/components/illustration/brand-illustrations";

export function InitiativesHero() {
  const { hero } = initiativeOverviewContent;

  return (
    <PublicPageHero
      figure={<AscentIllustration />}
      headingId="initiatives-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      primaryAction={hero.primaryCallToAction}
      secondaryAction={hero.secondaryCallToAction}
    />
  );
}
