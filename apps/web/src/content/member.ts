/**
 * Copy for the real Member Registration + affiliation experience (Phase
 * C2). Kept as data, matching the join.ts/homepage.ts convention.
 */

export const memberLoggedOutContent = {
  eyebrow: "MEMBERSHIP",
  title: "Join as a Member",
  description:
    "Become part of Tamil Ulagam through a registered Organisation or Tamil Sangam.",
  steps: [
    {
      title: "Find a registered Organisation or Tamil Sangam",
      description: "Search the directory of verified organisations.",
    },
    {
      title: "Request to join",
      description: "Send an affiliation request in one step — no long form.",
    },
    {
      title: "The Organisation confirms affiliation",
      description:
        "A manager reviews your request and decides whether to approve it.",
    },
    {
      title: "Membership becomes active",
      description:
        "Once approved, your affiliation appears in your Member Workspace.",
    },
  ],
} as const;

export const memberDirectoryContent = {
  title: "Find your Organisation or Tamil Sangam",
  description:
    "Search by name, city, region or country. Only verified organisations appear here.",
  searchPlaceholder: "Search by name, city, region or country…",
  searchLabel: "Search organisations and Tamil Sangams",
} as const;

export const memberConfirmContent = {
  disclaimer:
    "The organisation will review this request. This does not grant organisation-management access.",
} as const;
