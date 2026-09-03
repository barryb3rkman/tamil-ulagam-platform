import { PublicPageHero } from "@/components/public-page-hero";
import { partnersContent } from "@/content/partners";
import { PillarsIllustration } from "@/components/illustration/brand-illustrations";

export function PartnersHero() {
  const { hero } = partnersContent;

  return (
    <PublicPageHero
      figure={<PillarsIllustration />}
      headingId="partners-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      caption={hero.caption}
      primaryAction={hero.primaryCallToAction}
      secondaryAction={hero.secondaryCallToAction}
    />
  );
}
