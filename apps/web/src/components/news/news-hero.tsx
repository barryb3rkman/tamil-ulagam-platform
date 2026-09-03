import { PublicPageHero } from "@/components/public-page-hero";
import { newsContent } from "@/content/news";
import { SignalIllustration } from "@/components/illustration/brand-illustrations";

export function NewsHero() {
  const { hero } = newsContent;

  return (
    <PublicPageHero
      figure={<SignalIllustration />}
      headingId="news-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      caption={hero.caption}
      primaryAction={hero.primaryCallToAction}
      secondaryAction={hero.secondaryCallToAction}
    />
  );
}
