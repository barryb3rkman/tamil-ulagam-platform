import { Container, ImageWithFallback } from "@tamil-ulagam/ui";

import { joinImages } from "@/config/join-images";
import { joinHeroContent } from "@/content/join";

/**
 * The /join hub's identity moment: a full-bleed Federation Night hero
 * with the abstract pilot image as an integrated visual layer (not a
 * card pasted beside text). A masked Federation Night veil — the same
 * reusable gradient token used for every Deep hero, not a one-off
 * invented here — sits over the left/text-safe zone and fades out
 * toward the image's visual-energy region on the right, so the copy
 * stays legible without flattening the photo into wallpaper.
 */
export function JoinHero() {
  return (
    <section
      aria-labelledby="join-hero-title"
      className="surface-deep relative overflow-hidden"
    >
      {/* The image itself stays out of aria-hidden — it carries a real,
          descriptive alt and the accessible name for this section already
          comes from the heading below, matching the existing home-hero.tsx
          convention. Only the decorative gradient veil is hidden. */}
      <div className="absolute inset-0">
        <ImageWithFallback
          asset={joinImages.joinHubHero}
          priority
          sizes="100vw"
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          data-motion-ambient=""
          className="gradient-federation-night absolute inset-0 [mask-image:linear-gradient(to_right,black_0%,black_72%,transparent_96%)] [mask-repeat:no-repeat] sm:[mask-image:linear-gradient(to_right,black_0%,black_48%,transparent_78%)]"
        />
      </div>

      <Container className="relative py-20 sm:py-28 lg:py-36">
        <div data-motion-mask className="max-w-2xl">
          <p className="text-heritage-gold text-xs font-bold tracking-[0.16em] uppercase">
            {joinHeroContent.eyebrow}
          </p>
          <h1
            id="join-hero-title"
            className="text-display mt-6 text-balance text-white"
          >
            {joinHeroContent.title}
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-white/85">
            {joinHeroContent.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
