import { PublicPageHero } from "@/components/public-page-hero";
import { contactContent } from "@/content/contact";
import { ExchangeIllustration } from "@/components/illustration/brand-illustrations";

export function ContactHero() {
  const { hero } = contactContent;

  return (
    <PublicPageHero
      figure={<ExchangeIllustration />}
      headingId="contact-title"
      eyebrow={hero.eyebrow}
      title={hero.title}
      description={hero.description}
      caption={hero.note}
      primaryAction={hero.primaryCallToAction}
      secondaryAction={hero.secondaryCallToAction}
    />
  );
}
