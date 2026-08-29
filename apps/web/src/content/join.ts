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
}

export const joinJourneys: readonly JoinJourney[] = [
  {
    id: "organisation",
    eyebrow: "ORGANISATIONS",
    title: "Organisation",
    description: "Register your Organisation with Tamil Ulagam.",
    cta: "Start registration",
    href: "/join/organisation",
  },
  {
    id: "sangam",
    eyebrow: "TAMIL SANGAMS",
    title: "Tamil Sangam",
    description: "Register your Tamil Sangam with Tamil Ulagam.",
    cta: "Begin your Sangam's presence",
    href: "/join/sangam",
  },
  {
    id: "member",
    eyebrow: "MEMBERSHIP",
    title: "Member",
    description:
      "Connect your Tamil Ulagam account to a registered Tamil Sangam or Organisation you already belong to.",
    cta: "Connect your membership",
    href: "/join/member",
  },
  {
    id: "partner",
    eyebrow: "PARTNERSHIP",
    title: "Partner",
    description: "Explore institutional and programme partnerships.",
    cta: "Explore partnership",
    href: "/partners",
  },
] as const;
