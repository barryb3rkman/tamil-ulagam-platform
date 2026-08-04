import type { InitiativeSlug } from "./initiatives";

export const homepageContent = {
  hero: {
    eyebrowTamil: "தமிழ் உலகம்",
    eyebrowEnglish: "TAMIL ULAGAM GLOBAL FEDERATION",
    title: "Connecting the Global Tamil Community",
    description:
      "Tamil Ulagam is a global digital bridge connecting people, organisations, knowledge and opportunity through technology, culture and collaboration.",
  },
  visionSignals: [
    "Connect",
    "Preserve",
    "Empower",
    "Support",
    "Foster",
    "Celebrate",
  ],
  pillars: [
    {
      title: "Connect",
      description:
        "A shared global home for Tamil communities, organisations and chapters.",
      imageKey: "pillarConnect",
      href: "/about",
    },
    {
      title: "Empower",
      description:
        "Pathways for education, careers, enterprise and meaningful collaboration.",
      imageKey: "pillarEmpower",
      href: "/initiatives",
    },
    {
      title: "Preserve",
      description:
        "Tamil language, knowledge, arts and heritage for generations to come.",
      imageKey: "pillarPreserve",
      href: "/initiatives/arts-culture",
    },
  ],
  why: {
    title: "A global community deserves a global digital home.",
    description:
      "Tamil communities thrive across countries and generations, yet connections between people, organisations, knowledge and opportunity remain fragmented. Tamil Ulagam forms a trusted digital bridge for one connected future.",
  },
  tamilId: {
    eyebrow: "DIGITAL MEMBERSHIP",
    title: "One membership. A world of connection.",
    description:
      "Tamil ID connects one secure digital membership credential with chapters, events, organisations and community experiences.",
    features: [
      "Secure membership identity",
      "Privacy-conscious verification",
      "Global chapter connection",
      "Events and member access",
    ],
  },
  initiatives: {
    title: "Building an ecosystem for every dimension of Tamil life.",
    description:
      "Tamil Ulagam’s long-term vision brings community, knowledge, wellbeing, enterprise and culture into one connected global platform.",
    presentation: {
      featured: [
        "healthcare",
        "education",
      ] as const satisfies readonly InitiativeSlug[],
      medium: [
        "business",
        "jobs",
        "research",
      ] as const satisfies readonly InitiativeSlug[],
      supporting: [
        "tourism",
        "arts-culture",
        "global-events",
      ] as const satisfies readonly InitiativeSlug[],
      mobileFeatured: [
        "healthcare",
        "education",
        "business",
        "jobs",
      ] as const satisfies readonly InitiativeSlug[],
    },
  },
  chapters: {
    eyebrow: "GLOBAL CHAPTER VISION",
    title: "One organisation. Every continent.",
    description:
      "Tamil Ulagam connects local Tamil communities through trusted country and city chapters within one shared global federation.",
  },
  mobile: {
    eyebrow: "MOBILE PLATFORM",
    title: "The Tamil community, always within reach.",
    description:
      "The Tamil Ulagam mobile experience brings digital membership, chapter updates, events, community news and opportunities into one connected application vision.",
    features: [
      "Tamil ID access",
      "Chapter and event updates",
      "Community announcements",
      "Services and opportunities",
    ],
  },
  partnership: {
    title: "Building the Tamil world requires trusted collaboration.",
    description:
      "Tamil associations, educational institutions, healthcare organisations, businesses, cultural bodies and community leaders can help shape a responsible global platform.",
  },
  stories: {
    title: "Stories that carry a global community forward.",
    description:
      "Tamil Ulagam’s editorial vision highlights community achievements, intergenerational knowledge, cultural journeys and meaningful global contributions.",
  },
  finalCta: {
    title: "The Tamil world is everywhere. Now it can have one home.",
    description:
      "Join the vision for a more connected, empowered and celebrated global Tamil community.",
  },
} as const;
