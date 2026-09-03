import { PublicPageHero } from "@/components/public-page-hero";
import { aboutContent } from "@/content/about";
import { NetworkIllustration } from "@/components/illustration/brand-illustrations";

export function AboutHero() {
  const { hero } = aboutContent;

  return (
    <PublicPageHero
      figure={<NetworkIllustration />}
      headingId="about-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      primaryAction={hero.primaryCallToAction}
      secondaryAction={hero.secondaryCallToAction}
    />
  );
}
