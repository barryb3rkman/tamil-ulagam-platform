import type { ImageMetadata } from "@tamil-ulagam/shared";

/**
 * Visual assets for the /join ecosystem entrance (Product Architecture
 * V3). The three source PNGs supplied in Phase B1 are kept, untouched,
 * as masters (apps/web/public/images/tamil-ulagam/join/*.png) — every
 * entry below instead serves a WebP derivative generated from that
 * master via `cwebp -q 82..84 -m 6` (Phase C1), which cut each asset by
 * ~93–96% with no visible quality loss (see the Phase C1 completion
 * report for exact before/after byte counts). Regenerate the WebP files
 * from their PNG masters with the same command if a master is ever
 * replaced — nothing else here needs to change.
 *
 * `joinHubHero` additionally ships a real mobile crop
 * (join-hub-hero-mobile.webp, a 657×821 crop of the source's
 * right-hand energetic region — the same region called out as the
 * hero's visual-energy zone in the Phase B1 asset plan), so
 * `mobileAlternative` is `true` here (unlike the other two, which are
 * shown as a single contained editorial image, not a full-bleed hero,
 * and don't need a dedicated crop).
 *
 * Kept separate from `images.ts` deliberately: `images.ts` backs
 * screens that are live today; this file backs the /join surfaces,
 * so the two can evolve independently without risking the working
 * image manifest.
 */
export const joinImages = {
  /**
   * /join hub hero — full-bleed Deep hero, "Federation Night" gradient
   * composition (no people).
   */
  joinHubHero: {
    path: "/images/tamil-ulagam/join/join-hub-hero.webp",
    mobilePath: "/images/tamil-ulagam/join/join-hub-hero-mobile.webp",
    alt: "Abstract Federation Night gradient composition — deep navy blending into a restrained maroon glow, with fine kolam-derived gold linework",
    width: 1916,
    height: 821,
    aspectRatio: "1916/821",
    mobileWidth: 657,
    mobileHeight: 821,
    mobileAspectRatio: "657/821",
    objectPosition: "70% 50%",
    mobileObjectPosition: "center",
    aboveFold: true,
    mobileAlternative: true,
    available: true,
  },
  /**
   * /join/organisation hero — premium architectural stone/material
   * detail (no people). Not yet used on a live route in Phase C1 (the
   * Organisation journey aliases straight to the existing registration
   * flow — see the routing note in the Phase C1 report), prepared here
   * for the dedicated Organisation journey page a later phase builds.
   */
  organisationJourneyHero: {
    path: "/images/tamil-ulagam/join/organisation-journey-hero.webp",
    alt: "Elegant carved stone architectural detail in warm late-afternoon light, evoking institutional permanence and craftsmanship",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    objectPosition: "center",
    aboveFold: true,
    mobileAlternative: false,
    available: true,
  },
  /**
   * /join/sangam hero — a culturally grounded, contemporary still-life
   * (a traditional brass kuthuvilakku and kolam-patterned inlay against
   * a blurred global city skyline) — no people, no literal temple or
   * boardroom imagery. Used on the /join/sangam pre-launch surface.
   */
  sangamJourneyHero: {
    path: "/images/tamil-ulagam/join/sangam-journey-hero.webp",
    alt: "A traditional brass oil lamp and kolam-patterned inlaid table in a contemporary home, with a global city skyline visible through the window at dusk",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    objectPosition: "center",
    aboveFold: true,
    mobileAlternative: false,
    available: true,
  },
} as const satisfies Record<string, ImageMetadata>;

export type JoinImageKey = keyof typeof joinImages;
