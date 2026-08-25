/**
 * Copy and structural data for the /join ecosystem entrance (Product
 * Architecture V3, Phase C1). Kept as data — not hardcoded in JSX — so
 * copy can be revised without touching component logic, matching the
 * convention already used by homepage.ts/partners.ts etc.
 */

export const joinHeroContent = {
  eyebrow: "JOIN TAMIL ULAGAM",
  title: "Your place in the global Tamil community starts here.",
  description:
    "Register an organisation, establish your Tamil Sangam, join as a member, or explore a partnership — choose the path that fits.",
} as const;

export type JoinJourneyId = "organisation" | "sangam" | "member" | "partner";

export interface JoinJourney {
  readonly id: JoinJourneyId;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly cta: string;
  readonly href: `/${string}`;
  /** Shown instead of `title`/`cta` when the visitor already has a
   * relevant in-progress record — see join-experience.tsx. */
  readonly resumeTitle?: string;
  readonly resumeCta?: string;
}

export const joinJourneys: readonly JoinJourney[] = [
  {
    id: "organisation",
    eyebrow: "ORGANISATIONS",
    title: "Register an Organisation",
    description:
      "For businesses, education, healthcare, NGOs, cultural institutions, professional bodies and other organisations.",
    cta: "Start registration",
    href: "/join/organisation",
    resumeTitle: "Continue your registration",
    resumeCta: "Resume where you left off",
  },
  {
    id: "sangam",
    eyebrow: "TAMIL SANGAMS",
    title: "Register a Tamil Sangam",
    description:
      "Join the wider Tamil Sangam network and establish your Sangam's presence within Tamil Ulagam.",
    cta: "Begin your Sangam's presence",
    href: "/join/sangam",
  },
  {
    id: "member",
    eyebrow: "MEMBERSHIP",
    title: "Join as a Member",
    description:
      "Become part of Tamil Ulagam through a registered organisation or Tamil Sangam.",
    cta: "See how membership works",
    href: "/join/member",
  },
  {
    id: "partner",
    eyebrow: "PARTNERSHIP",
    title: "Partner With Us",
    description:
      "Explore strategic, community, business, education, healthcare, technology and cultural collaborations.",
    cta: "Explore partnership",
    href: "/partners",
  },
] as const;
