import { PublicPageHero } from "@/components/public-page-hero";
import { chaptersContent } from "@/content/chapters";
import { NetworkIllustration } from "@/components/illustration/brand-illustrations";

export function ChaptersHero() {
  const { hero } = chaptersContent;

  return (
    <PublicPageHero
      figure={<NetworkIllustration />}
      headingId="chapters-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      caption={hero.caption}
      primaryAction={hero.primaryCallToAction}
      secondaryAction={hero.secondaryCallToAction}
    />
  );
}
