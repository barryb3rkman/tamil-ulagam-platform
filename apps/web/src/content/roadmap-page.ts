import type { CallToAction } from "@tamil-ulagam/shared";

import type { ImageKey } from "@/config/images";
import { roadmapPhases } from "@/content/roadmap";

type RoadmapImageKey = Extract<ImageKey, "roadmapFuture">;
type RoadmapPhaseId = (typeof roadmapPhases)[number]["id"];

interface RoadmapHeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly caption: string;
  readonly imageKey: RoadmapImageKey;
  readonly primaryCallToAction: CallToAction;
  readonly secondaryCallToAction: CallToAction;
}

interface LabeledStatement {
  readonly title: string;
  readonly description: string;
}

interface DependencyStatement extends LabeledStatement {
  readonly phaseId: RoadmapPhaseId;
}

interface PlatformLayer {
  readonly title: string;
  readonly items: readonly string[];
}

export const roadmapPageContent = {
  hero: {
    eyebrow: "TAMIL ULAGAM DEVELOPMENT ROADMAP",
    title: "Build the foundation. Connect the community. Expand with purpose.",
    description:
      "Tamil Ulagam is being developed as a staged global platform. Each layer must establish the policy, governance, technology and operational readiness required by the next.",
    status: "Current Focus · Public Foundation",
    caption:
      "Strategic direction. Sequence and scope may evolve through approved planning and community learning.",
    imageKey: "roadmapFuture",
    primaryCallToAction: {
      label: "Explore the Phases",
      href: "/roadmap#roadmap-phases",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Explore Tamil Ulagam",
      href: "/about",
      variant: "text",
    },
  } satisfies RoadmapHeroContent,
  sequence: {
    eyebrow: "WHY THE SEQUENCE MATTERS",
    title: "A large global platform cannot be built responsibly all at once.",
    description:
      "Trust, identity, local participation and useful services each depend on foundations that must be established with care.",
    principles: [
      {
        title: "Foundation before scale",
        description: "Public trust requires honest, accessible foundations.",
      },
      {
        title: "Governance before automation",
        description:
          "Membership and identity require policy, administration and accountable ownership.",
      },
      {
        title: "Verified participation before marketplaces",
        description:
          "Chapters, organisations and events need clear structures before service ecosystems expand.",
      },
      {
        title: "Controlled pilots before global expansion",
        description:
          "Initiative services should advance through verified partners and careful learning.",
      },
      {
        title: "Community usefulness before feature volume",
        description:
          "Mobile access and expansion should follow stable capabilities that people can genuinely rely on.",
      },
    ] as const satisfies readonly LabeledStatement[],
  },
  foundation: {
    eyebrow: "CURRENT BUILD FOCUS",
    title: "The permanent public foundation comes first.",
    description:
      "The current development focus is the permanent public website foundation. It is intended to remain the public front door as future systems are added, not to be replaced by a disposable launch page.",
    status: "In Development",
    items: [
      "Tamil Ulagam’s public identity, vision, mission and purpose",
      "Initiative definitions, Tamil ID concept and chapter model",
      "Roadmap and participation pathways",
      "Shared design and content standards",
      "Bilingual-ready architecture",
      "Accessible, responsive public information",
      "Future integration boundaries",
    ],
  },
  dependencies: {
    eyebrow: "HOW THE PHASES DEPEND ON EACH OTHER",
    title: "Every phase creates the conditions required by the next.",
    description:
      "The sequence is deliberate: the public layer establishes trust, secure participation supports local structures, and proven capabilities can then expand responsibly.",
    items: [
      {
        phaseId: "public-foundation",
        title: "Public foundation",
        description: "Establishes identity, content and trust.",
      },
      {
        phaseId: "identity-and-membership",
        title: "Membership and Tamil ID",
        description:
          "Establish secure people, permissions and a verifiable membership credential.",
      },
      {
        phaseId: "chapters-organisations-events",
        title: "Chapters, organisations and events",
        description:
          "Establish accountable local and institutional participation with recurring engagement.",
      },
      {
        phaseId: "knowledge-wellbeing-opportunity",
        title: "Initiative pilots",
        description:
          "Introduce useful service experiences through verified partners and controlled pilots.",
      },
      {
        phaseId: "mobile-access-member-communication",
        title: "Mobile access",
        description: "Extends proven platform capabilities to member devices.",
      },
      {
        phaseId: "responsible-global-expansion",
        title: "Global expansion",
        description:
          "Scales systems that have demonstrated value and operational readiness.",
      },
    ] as const satisfies readonly DependencyStatement[],
  },
  platformLayers: {
    eyebrow: "PLATFORM LAYERS",
    title: "One roadmap, built across connected platform layers.",
    description:
      "These planned layers are intended to share governed identity, administration and platform standards rather than operate as disconnected services.",
    status: "Planned connected architecture",
    layers: [
      {
        title: "Public layer",
        items: [
          "Website",
          "News and resources",
          "Initiative information",
          "Public events",
          "Public verification pages",
        ],
      },
      {
        title: "Member layer",
        items: [
          "Accounts",
          "Profiles",
          "Membership",
          "Tamil ID",
          "Privacy settings",
          "Notifications",
        ],
      },
      {
        title: "Community and institutional layer",
        items: [
          "Chapters",
          "Organisations",
          "Administrators",
          "Events",
          "Partnerships",
          "Local communication",
        ],
      },
      {
        title: "Services and opportunity layer",
        items: [
          "Education",
          "Healthcare discovery",
          "Business",
          "Jobs",
          "Research",
          "Tourism",
          "Culture",
          "Global programs",
        ],
      },
    ] as const satisfies readonly PlatformLayer[],
  },
  readiness: {
    eyebrow: "ADVANCE ONLY WHEN READY",
    title:
      "A phase should move forward only when its foundations are credible.",
    items: [
      "Approved purpose and scope",
      "Named operational ownership",
      "Policy and governance readiness",
      "Privacy and security review",
      "Administrative workflows",
      "Verified content, partners or service supply",
      "Support and incident processes",
      "Accessibility and responsive quality",
      "Testing and deployment readiness",
      "Measurable community need",
      "Controlled pilot plan",
      "Review and expansion criteria",
    ],
    statement:
      "Tamil Ulagam should not launch an empty platform layer merely to make the roadmap appear complete.",
  },
  quality: {
    eyebrow: "QUALITY, SECURITY AND OPERATIONS",
    title: "Growth must not compromise trust.",
    principles: [
      "Privacy by design",
      "Server-side permission enforcement",
      "Role-based administration",
      "Auditable decisions",
      "Verified organisations and providers",
      "Honest service status",
      "Accessible public experiences",
      "Reliable backup and recovery",
      "Responsible moderation",
      "Clear support ownership",
      "Country-aware legal review",
      "Measured expansion",
    ],
    links: [
      { label: "Explore Tamil ID", href: "/tamil-id", variant: "text" },
      { label: "Explore Chapters", href: "/chapters", variant: "text" },
    ] as const satisfies readonly CallToAction[],
  },
  adaptability: {
    eyebrow: "WHAT MAY CHANGE",
    title: "The direction is deliberate. The details must remain adaptable.",
    description:
      "Approved planning, policy decisions and community learning may refine how the roadmap is delivered without compromising the principles that guide it.",
    mayChange: [
      "Exact feature scope",
      "Ordering within a phase",
      "Membership categories",
      "Governance policies",
      "Chapter structure",
      "Initiative pilot selection",
      "Partner participation",
      "Mobile timing",
      "Operational regions",
      "Public terminology",
    ],
    remainsStable: [
      "Tamil Ulagam’s mission",
      "Privacy and trust principles",
      "Honest communication",
      "Responsible governance",
      "Accessibility",
      "Staged development",
      "Respect for existing Tamil organisations",
      "Refusal to misrepresent planned features as active",
    ],
  },
  participation: {
    eyebrow: "PARTICIPATION AND PARTNERSHIPS",
    title: "The roadmap will become stronger through informed participation.",
    description:
      "Future planning may benefit from perspectives across community, institutional, cultural and operational life.",
    groups: [
      "Tamil community organisations",
      "Chapter leaders",
      "Privacy and identity professionals",
      "Educators and universities",
      "Healthcare institutions",
      "Employers and business networks",
      "Researchers and archivists",
      "Cultural institutions",
      "Event organisers",
      "Technology and operational partners",
      "Community members",
    ],
    note: "Participation does not imply an approved partnership or delivery commitment.",
    primaryCallToAction: {
      label: "Partner With Tamil Ulagam",
      href: "/partners",
      variant: "primary",
    },
    secondaryCallToAction: {
      label: "Contact Us",
      href: "/contact",
      variant: "secondary",
    },
    textCallToAction: {
      label: "Explore Initiatives",
      href: "/initiatives",
      variant: "text",
    },
  },
  faqs: [
    {
      title: "Does the roadmap include confirmed launch dates?",
      description: "No. Public delivery dates have not been approved.",
    },
    {
      title: "Is the public website the final Tamil Ulagam platform?",
      description:
        "No. It is intended to become the permanent public foundation while future member and service systems are added.",
    },
    {
      title: "Is Tamil ID currently operational?",
      description: "No. Tamil ID is presented as a planned membership concept.",
    },
    {
      title: "Are chapters currently active?",
      description: "No active chapter directory is currently being presented.",
    },
    {
      title: "Will every initiative launch at the same time?",
      description:
        "No. Initiatives may move forward at different speeds based on need, verified partners and operational readiness.",
    },
    {
      title: "When will membership applications open?",
      description:
        "Membership policy, administration and platform systems must be completed before applications open.",
    },
    {
      title: "Will there be a mobile application?",
      description:
        "Mobile access is part of the long-term platform direction after the member foundation is stable.",
    },
    {
      title: "Can the roadmap change?",
      description:
        "Yes. Details may evolve through approved planning, policy decisions and community learning.",
    },
    {
      title: "How will Tamil Ulagam decide what to build next?",
      description:
        "Decisions should consider readiness, governance, community value, partner quality, risk and operational capacity.",
    },
    {
      title: "Can organisations participate now?",
      description:
        "Organisations may begin a discussion through the Partners or Contact pages, but discussion does not represent an approved partnership.",
    },
  ] as const satisfies readonly LabeledStatement[],
  finalCallToAction: {
    eyebrow: "BUILDING WITH PURPOSE",
    title:
      "A global platform becomes credible one responsible phase at a time.",
    description:
      "Tamil Ulagam’s roadmap is designed to protect trust while gradually connecting identity, community, culture and opportunity.",
    primaryCallToAction: {
      label: "Explore Tamil Ulagam",
      href: "/about",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Partner With Us",
      href: "/partners",
      variant: "text",
    },
    textCallToAction: {
      label: "Contact Us",
      href: "/contact",
      variant: "text",
    },
  },
} as const;
