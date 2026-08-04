import type { CallToAction } from "@tamil-ulagam/shared";

import type { ImageKey } from "@/config/images";

type AboutImageKey = Extract<
  ImageKey,
  "aboutHero" | "partnerships" | "roadmapFuture"
>;

interface AboutHeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly imageKey: AboutImageKey;
  readonly primaryCallToAction: CallToAction;
  readonly secondaryCallToAction: CallToAction;
}

interface AboutObjective {
  readonly title: string;
  readonly description: string;
}

interface AboutChallenge {
  readonly title: string;
  readonly description: string;
}

interface EcosystemGroup {
  readonly title: string;
  readonly items: readonly string[];
}

interface GovernancePrinciple {
  readonly title: string;
  readonly description: string;
}

export const aboutContent = {
  hero: {
    eyebrow: "ABOUT TAMIL ULAGAM",
    title: "A global home for Tamil identity, connection and progress.",
    description:
      "Tamil Ulagam is a trusted digital bridge connecting Tamil people, organisations, knowledge, culture and opportunity across borders.",
    imageKey: "aboutHero",
    primaryCallToAction: {
      label: "Explore Our Vision",
      href: "/about#vision-mission",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "View the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  } satisfies AboutHeroContent,
  manifesto: {
    statement:
      "The Tamil world is global. Its digital future should be connected.",
    paragraphs: [
      "Tamil communities have grown across countries, professions and generations. Yet the systems that connect people, organisations, knowledge, services and opportunity remain fragmented.",
      "Tamil Ulagam is a shared global platform where identity is respected, collaboration is strengthened and Tamil heritage continues into the future.",
    ],
  },
  visionMission: {
    title: "Vision and mission",
    vision: {
      label: "VISION",
      title:
        "A world where every Tamil, wherever they live, is connected, empowered and celebrated.",
      supportingLine: "One platform. Many communities. A shared future.",
    },
    mission: {
      label: "MISSION",
      title:
        "To build a comprehensive digital bridge for the global Tamil community through technology, culture and collaboration.",
      supportingLine: "Heritage preserved. Future built.",
    },
  },
  challenge: {
    eyebrow: "THE CHALLENGE",
    title: "A worldwide community should not remain digitally fragmented.",
    description:
      "Tamil Ulagam strengthens connections between existing communities and institutions while making shared pathways easier to discover and shape together.",
    statements: [
      {
        title: "Community fragmentation",
        description:
          "Tamil communities and organisations operate across countries without one trusted shared digital home.",
      },
      {
        title: "Intergenerational continuity",
        description:
          "Language, cultural knowledge and identity require stronger digital pathways for younger generations.",
      },
      {
        title: "Disconnected opportunity",
        description:
          "Professional, educational, business and research networks often remain isolated from one another.",
      },
      {
        title: "Uneven access",
        description:
          "Useful information, support and community services are not equally discoverable across borders.",
      },
    ] as const satisfies readonly AboutChallenge[],
  },
  objectives: {
    eyebrow: "OUR CORE OBJECTIVES",
    title: "A shared purpose, expressed through practical direction.",
    entries: [
      {
        title: "Connect",
        description:
          "Unite Tamil communities globally through a shared digital home.",
      },
      {
        title: "Preserve",
        description:
          "Support Tamil language, culture, knowledge and heritage for future generations.",
      },
      {
        title: "Empower",
        description:
          "Create pathways for Tamil entrepreneurs, professionals, students and emerging leaders.",
      },
      {
        title: "Support",
        description:
          "Improve the discovery of trusted welfare, wellbeing and community resources across borders.",
      },
      {
        title: "Foster",
        description:
          "Encourage partnerships, academic collaboration, research and innovation networks.",
      },
      {
        title: "Celebrate",
        description:
          "Recognise Tamil excellence across culture, education, service, enterprise, science and leadership.",
      },
    ] as const satisfies readonly AboutObjective[],
  },
  ecosystem: {
    eyebrow: "THE CONNECTED PLATFORM",
    title: "More than a website — a connected digital ecosystem.",
    description:
      "Public information, community connection, membership and opportunity belong to one coherent digital ecosystem.",
    groups: [
      {
        title: "Public connection",
        items: [
          "Public website",
          "Content",
          "Community information",
          "Organisations and chapters",
        ],
      },
      {
        title: "Membership",
        items: ["Membership", "Tamil ID", "Events", "Notifications"],
      },
      {
        title: "Opportunity",
        items: [
          "Education",
          "Healthcare",
          "Business",
          "Jobs",
          "Research",
          "Culture",
        ],
      },
    ] as const satisfies readonly EcosystemGroup[],
    callToAction: {
      label: "Explore Initiatives",
      href: "/initiatives",
      variant: "secondary",
    },
  },
  governance: {
    eyebrow: "TRUST BY DESIGN",
    title: "A global federation must be built with clear responsibility.",
    description:
      "Tamil Ulagam’s long-term credibility depends not only on technology, but on transparent governance, accountable administration, privacy-conscious systems and trusted collaboration.",
    imageKey: "partnerships",
    principles: [
      {
        title: "Clear ownership",
        description:
          "Defined responsibilities for product, membership, content, chapters and operations.",
      },
      {
        title: "Privacy-conscious design",
        description:
          "Collect only necessary information and separate public profiles from private member data.",
      },
      {
        title: "Controlled administration",
        description:
          "Role-based access, approvals, audit records and accountable operational workflows.",
      },
      {
        title: "Honest communication",
        description:
          "Services, partnerships and milestones must be represented accurately and with clear responsibility.",
      },
      {
        title: "Responsible collaboration",
        description:
          "Work with verified institutions, organisations and community leaders through clear agreements.",
      },
    ] as const satisfies readonly GovernancePrinciple[],
    callToAction: {
      label: "Partnership Vision",
      href: "/partners",
      variant: "text",
    },
  },
  roadmap: {
    eyebrow: "THE DEVELOPMENT PATH",
    title: "Building carefully, growing responsibly.",
    description:
      "Each phase extends the foundation with the governance, product and operational care appropriate to that stage.",
    imageKey: "roadmapFuture",
    callToAction: {
      label: "View Full Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  } satisfies {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly imageKey: AboutImageKey;
    readonly callToAction: CallToAction;
  },
  culturalStatement: {
    tamil: "யாதும் ஊரே யாவரும் கேளிர்",
    translation: "Every place is our home; everyone is our kin.",
    attribution: "Kaniyan Pungundranar · Purananuru",
    reflection:
      "An enduring Tamil humanism that speaks directly to a connected global future.",
  },
  finalCallToAction: {
    title: "Help shape a connected future for the global Tamil community.",
    description:
      "Tamil Ulagam welcomes thoughtful participation from individuals, Tamil associations, institutions, professionals, educators, cultural organisations and responsible partners.",
    primaryCallToAction: {
      label: "Explore Tamil Ulagam",
      href: "/initiatives",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Partner With Us",
      href: "/partners",
      variant: "text",
    },
    contactCallToAction: {
      label: "Contact Us",
      href: "/contact",
      variant: "text",
    },
  },
} as const;
