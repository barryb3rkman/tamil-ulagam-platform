import type { InitiativeSlug } from "./initiatives";

export const homepageContent = {
  hero: {
    eyebrowTamil: "தமிழ் உலகம்",
    eyebrowEnglish: "TAMIL ULAGAM GLOBAL FEDERATION",
    title: "Connecting the Global Tamil Community",
    description:
      "Tamil Ulagam is building a global digital bridge through technology, culture and collaboration—connecting people, organisations, knowledge and opportunity across borders.",
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
      "Tamil communities thrive across countries and generations, yet connections between people, organisations, knowledge and opportunity remain fragmented. Tamil Ulagam is being built as a trusted digital bridge for one connected future.",
  },
  tamilId: {
    eyebrow: "PLANNED DIGITAL MEMBERSHIP",
    title: "One membership. A world of connection.",
    description:
      "Tamil ID is envisioned as a secure digital membership credential connecting members with chapters, events, organisations and future partner services.",
    features: [
      "Secure membership identity",
      "Privacy-conscious verification",
      "Global chapter connection",
      "Future events and member benefits",
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
      "Tamil Ulagam aims to connect local Tamil communities through trusted country and city chapters operating within one shared global federation.",
  },
  mobile: {
    eyebrow: "FUTURE MOBILE PLATFORM",
    title: "The Tamil community, always within reach.",
    description:
      "The future Tamil Ulagam mobile experience will bring digital membership, chapter updates, events, community news and opportunities into one connected application.",
    features: [
      "Tamil ID access",
      "Chapter and event updates",
      "Community announcements",
      "Future services and opportunities",
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
      "Tamil Ulagam will highlight community achievements, intergenerational knowledge, cultural journeys and meaningful global contributions.",
  },
  finalCta: {
    title: "The Tamil world is everywhere. Now it can have one home.",
    description:
      "Join the vision for a more connected, empowered and celebrated global Tamil community.",
  },
} as const;
