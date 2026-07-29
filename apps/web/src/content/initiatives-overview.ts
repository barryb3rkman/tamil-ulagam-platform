import { initiatives, type InitiativeSlug } from "./initiatives";

export type InitiativeEcosystemGroupId =
  "human-development" | "opportunity-economy" | "knowledge-culture-global";

export interface InitiativeOverviewDetail {
  readonly purpose: string;
  readonly futureCapabilities: readonly string[];
  readonly availabilityStatement: string;
}

export const initiativeOverviewDetails = {
  healthcare: {
    purpose:
      "A future network for discovering trusted Tamil-speaking healthcare professionals, wellbeing information, and responsible community support.",
    futureCapabilities: [
      "Professional directory discovery",
      "Language-aware care discovery",
      "Health resources",
      "Future partner-supported programmes",
    ],
    availabilityStatement:
      "Concept in planning — consultations and care services are not available through Tamil Ulagam.",
  },
  education: {
    purpose:
      "A future learning ecosystem supporting Tamil language, cultural knowledge, mentorship, educational resources, and opportunity discovery.",
    futureCapabilities: [
      "Tamil learning resources",
      "Cultural education",
      "Scholarship and opportunity discovery",
      "Mentorship and tutor connections",
    ],
    availabilityStatement:
      "Concept in planning — courses, scholarships, and tutoring cannot currently be booked here.",
  },
  business: {
    purpose:
      "A future trusted network for Tamil-owned businesses, founders, professionals, and responsible collaboration.",
    futureCapabilities: [
      "Business discovery",
      "Founder and professional connections",
      "Responsible collaboration pathways",
    ],
    availabilityStatement:
      "Future initiative — listings, referrals, and commercial services are not currently available.",
  },
  jobs: {
    purpose:
      "A future careers platform connecting Tamil talent with verified organisations and meaningful opportunities.",
    futureCapabilities: [
      "Verified organisation discovery",
      "Career opportunity discovery",
      "Professional guidance pathways",
    ],
    availabilityStatement:
      "Future initiative — job listings, applications, and recruitment services are not currently available.",
  },
  research: {
    purpose:
      "A future space for digital preservation, academic collaboration, research discovery, and knowledge sharing.",
    futureCapabilities: [
      "Research discovery",
      "Knowledge preservation pathways",
      "Academic collaboration",
    ],
    availabilityStatement:
      "Future initiative — no research archive, funding programme, or grant application is currently available.",
  },
  tourism: {
    purpose:
      "A future discovery platform connecting diaspora communities with Tamil heritage, destinations, hospitality, and authentic experiences.",
    futureCapabilities: [
      "Heritage discovery",
      "Destination information",
      "Responsible cultural tourism guidance",
    ],
    availabilityStatement:
      "Future initiative — travel bookings, prices, and hospitality services are not currently available.",
  },
  "arts-culture": {
    purpose:
      "A future global stage for classical and contemporary Tamil creativity, heritage, and expression.",
    futureCapabilities: [
      "Creative work discovery",
      "Cultural knowledge pathways",
      "Respectful presentation and attribution",
    ],
    availabilityStatement:
      "Future initiative — artist programmes, awards, and cultural archives are not currently available.",
  },
  "global-events": {
    purpose:
      "A future shared platform for summits, cultural programmes, community gatherings, and chapter events.",
    futureCapabilities: [
      "Verified event discovery",
      "Community gathering visibility",
      "Future chapter coordination",
    ],
    availabilityStatement:
      "Future initiative — event publishing, registration, ticketing, and live programmes are not currently available.",
  },
} as const satisfies Record<InitiativeSlug, InitiativeOverviewDetail>;

export const initiativeOverviewContent = {
  hero: {
    eyebrow: "TAMIL ULAGAM INITIATIVES",
    title: "Building an ecosystem for every dimension of Tamil life.",
    description:
      "Tamil Ulagam’s long-term vision connects community, wellbeing, education, enterprise, opportunity, knowledge, and culture through one trusted global platform.",
    status: "Building the foundation",
    montageSlugs: ["healthcare", "research"] as const,
    primaryCallToAction: {
      label: "Explore the ecosystem",
      href: "#ecosystem",
    },
    secondaryCallToAction: {
      label: "View our roadmap",
      href: "/roadmap",
    },
  },
  introduction: {
    eyebrow: "ONE CONNECTED PURPOSE",
    title: "Eight initiatives. One connected purpose.",
    description:
      "The initiatives are not being designed as isolated websites. They are intended to share trusted identity, organisation records, chapters, events, notifications, search, administration, and responsible data foundations.",
    principles: [
      {
        title: "Shared foundation",
        description:
          "Common standards can make future participation more trustworthy and consistent across every initiative.",
      },
      {
        title: "Connected experience",
        description:
          "People and organisations should be able to discover relevant pathways without rebuilding their connection each time.",
      },
      {
        title: "Staged rollout",
        description:
          "Each initiative will move forward only when its purpose, governance, and operating readiness are clear.",
      },
    ],
  },
  groups: [
    {
      id: "human-development",
      number: "01",
      title: "Human development",
      description:
        "Supporting wellbeing, learning, access, and long-term personal development.",
      initiativeSlugs: ["healthcare", "education"],
    },
    {
      id: "opportunity-economy",
      number: "02",
      title: "Opportunity and economy",
      description:
        "Connecting Tamil enterprise, talent, professional mobility, and economic participation.",
      initiativeSlugs: ["business", "jobs", "tourism"],
    },
    {
      id: "knowledge-culture-global",
      number: "03",
      title: "Knowledge, culture and global presence",
      description:
        "Preserving knowledge, celebrating creativity, and strengthening Tamil presence on a global stage.",
      initiativeSlugs: ["research", "arts-culture", "global-events"],
    },
  ] as const satisfies readonly {
    readonly id: InitiativeEcosystemGroupId;
    readonly number: string;
    readonly title: string;
    readonly description: string;
    readonly initiativeSlugs: readonly InitiativeSlug[];
  }[],
  humanDevelopment: {
    eyebrow: "HUMAN DEVELOPMENT",
    title: "Wellbeing and learning, built with care.",
    description:
      "Healthcare and education are future initiatives centred on trusted discovery, useful knowledge, and responsible collaboration.",
    initiativeSlugs: ["healthcare", "education"] as const,
  },
  opportunityEconomy: {
    eyebrow: "OPPORTUNITY AND ECONOMY",
    title: "Connecting talent, enterprise and economic opportunity.",
    description:
      "Future pathways for professional connection, enterprise discovery, and culturally grounded travel will be introduced carefully and in stages.",
    initiativeSlugs: ["business", "jobs", "tourism"] as const,
  },
  knowledgeCultureGlobal: {
    eyebrow: "KNOWLEDGE, CULTURE AND GLOBAL PRESENCE",
    title:
      "Preserving knowledge. Celebrating excellence. Connecting the world.",
    description:
      "Research, creative expression, and future gathering spaces can help Tamil voices, ideas, and cultural work travel further with care.",
    initiativeSlugs: ["research", "arts-culture", "global-events"] as const,
  },
  sharedPlatform: {
    eyebrow: "HOW THE INITIATIVES CONNECT",
    title: "One identity. Shared foundations. Connected experiences.",
    description:
      "Over time, each initiative is intended to connect through shared standards rather than operate as an isolated destination.",
    status: "Planned shared platform foundation",
    foundations: [
      "Member identity",
      "Tamil ID",
      "Verified organisations",
      "Chapters and locations",
      "Events and participation",
      "Search and discovery",
      "Notifications",
      "Responsible administration",
    ],
    callToAction: {
      label: "Explore Tamil ID",
      href: "/tamil-id",
    },
  },
  readiness: {
    eyebrow: "BUILT IN STAGES",
    title: "Every initiative must be useful, trusted and operationally ready.",
    description:
      "Tamil Ulagam will not launch empty marketplaces or unverified service directories simply to appear complete.",
    principles: [
      "Clear operating model",
      "Verified partners",
      "Responsible data handling",
      "Administrative ownership",
      "Useful member adoption",
      "Security and privacy readiness",
      "Quality content or service supply",
      "Measurable community need",
    ],
    callToAction: {
      label: "View the roadmap",
      href: "/roadmap",
    },
  },
  directory: {
    eyebrow: "EXPLORE THE ECOSYSTEM",
    title: "Every initiative, in one place.",
    description:
      "Explore the long-term purpose and current planned status of each initiative.",
  },
  participation: {
    eyebrow: "RESPONSIBLE PARTICIPATION",
    title: "Help build initiatives that serve real community needs.",
    description:
      "Tamil Ulagam welcomes responsible participation from professionals, institutions, Tamil organisations, educators, healthcare leaders, entrepreneurs, researchers, cultural bodies, and community partners.",
    primaryCallToAction: {
      label: "Partner with Tamil Ulagam",
      href: "/partners",
    },
    secondaryCallToAction: {
      label: "Contact us",
      href: "/contact",
    },
    textCallToAction: {
      label: "Learn about Tamil Ulagam",
      href: "/about",
    },
  },
} as const;

const initiativeBySlug = new Map(
  initiatives.map((initiative) => [initiative.slug, initiative]),
);

export function getOverviewInitiative(slug: InitiativeSlug) {
  const initiative = initiativeBySlug.get(slug);

  if (!initiative) {
    throw new Error(`Missing initiative content for ${slug}`);
  }

  return initiative;
}

export function getOverviewInitiatives(slugs: readonly InitiativeSlug[]) {
  return slugs.map(getOverviewInitiative);
}
