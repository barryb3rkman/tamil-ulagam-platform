import { PublicPageHero } from "@/components/public-page-hero";
import { tamilIdContent } from "@/content/tamil-id";

import { TamilIdCard3D } from "./tamil-id-card-3d";

export function TamilIdHero() {
  const { hero } = tamilIdContent;

  return (
    <PublicPageHero
      headingId="tamil-id-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      caption={hero.caption}
      primaryAction={hero.primaryCallToAction}
      secondaryAction={hero.secondaryCallToAction}
      aside={<TamilIdCard3D />}
    />
  );
}
