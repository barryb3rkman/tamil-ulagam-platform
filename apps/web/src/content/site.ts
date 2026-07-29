import type { CallToAction, SocialLink } from "@tamil-ulagam/shared";

export const siteContent = {
  name: "Tamil Ulagam Global Federation",
  shortName: "Tamil Ulagam",
  description:
    "A permanent digital foundation for connecting Tamil communities, institutions, knowledge, and opportunity across the world.",
  purpose:
    "Tamil Ulagam is establishing a trusted global platform designed to grow responsibly with Tamil communities over time.",
  languages: ["English", "தமிழ்"] as const,
} as const;

export const primaryCallToAction: CallToAction = {
  label: "Explore the roadmap",
  href: "/roadmap",
  variant: "primary",
};

// Social profiles will be added only after official accounts are confirmed.
export const socialLinks: readonly SocialLink[] = [];
