import type { CallToAction } from "@tamil-ulagam/shared";

import type { ImageKey } from "@/config/images";

type ChaptersImageKey = Extract<ImageKey, "globalChapters" | "partnerships">;

interface ChaptersHeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly caption: string;
  readonly imageKey: Extract<ChaptersImageKey, "globalChapters">;
  readonly primaryCallToAction: CallToAction;
  readonly secondaryCallToAction: CallToAction;
}

interface LabeledStatement {
  readonly title: string;
  readonly description: string;
}

interface NumberedStatement extends LabeledStatement {
  readonly number: string;
}

type ChaptersFaq = LabeledStatement;

export const chaptersContent = {
  hero: {
    eyebrow: "GLOBAL CHAPTER NETWORK",
    title: "Local communities. One global federation.",
    description:
      "The Tamil Ulagam chapter vision connects local Tamil communities and organisations within one shared global federation.",
    caption: "Local Tamil communities connected through one global network.",
    imageKey: "globalChapters",
    primaryCallToAction: {
      label: "Understand the Chapter Vision",
      href: "/chapters#chapter-vision",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "View the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  } satisfies ChaptersHeroContent,
  definition: {
    eyebrow: "THE CHAPTER VISION",
    title: "A trusted local presence within one shared global mission.",
    description:
      "A Tamil Ulagam chapter is a recognised local unit of the federation: locally relevant, globally aligned and accountable to clear shared standards.",
    principles: [
      "A recognised local unit of the federation",
      "A connection point for communities and organisations",
      "A facilitator of local events and participation",
      "A responsible source of local information",
      "A pathway for community initiatives",
      "A contributor to global federation programs",
      "An accountable administrative boundary",
      "A locally relevant but globally aligned community structure",
    ],
  },
  localValue: {
    eyebrow: "WHY LOCAL CHAPTERS MATTER",
    title:
      "Global connection becomes meaningful through trusted local relationships.",
    statements: [
      {
        title: "Local understanding",
        description:
          "Countries and cities have different community needs, laws, institutions and opportunities.",
      },
      {
        title: "Community access",
        description:
          "Local chapters may help people discover trusted events, organisations and participation pathways.",
      },
      {
        title: "Language and culture",
        description:
          "Chapters can support locally relevant Tamil language and cultural activity.",
      },
      {
        title: "Institutional relationships",
        description:
          "Chapters may build responsible relationships with educational, cultural, business and community institutions.",
      },
      {
        title: "Community response",
        description:
          "Local leadership can help identify genuine needs and avoid one global team attempting to manage every local issue.",
      },
      {
        title: "Global representation",
        description:
          "Chapters may contribute local knowledge to federation-wide planning and programs.",
      },
    ] as const satisfies readonly LabeledStatement[],
  },
  relationship: {
    eyebrow: "GLOBAL AND LOCAL RELATIONSHIP",
    title: "Local responsibility. Shared standards. Global connection.",
    description:
      "The chapter model separates global standards from local responsibility so community participation remains relevant, accountable and connected.",
    federation: {
      title: "Global federation",
      items: [
        "Mission and values",
        "Platform standards",
        "Membership policy",
        "Tamil ID framework",
        "Shared technology",
        "Governance expectations",
        "Global partnerships",
        "Brand and communications",
      ],
    },
    chapter: {
      title: "Local chapter",
      items: [
        "Local community knowledge",
        "Chapter programs",
        "Local organisation relationships",
        "Locally relevant events",
        "Participation support",
        "Local moderation and administration",
        "Compliance with local requirements",
        "Reporting and accountability",
      ],
    },
    statement:
      "Tamil Ulagam chapters are intended to complement existing Tamil organisations, not replace them.",
  },
  formationJourney: {
    eyebrow: "CHAPTER-FORMATION JOURNEY",
    title: "A careful path from local interest to an accountable chapter.",
    description:
      "The formation journey connects local purpose, representative leadership and accountable federation review.",
    steps: [
      {
        number: "01",
        title: "Community interest",
        description:
          "Individuals or organisations express interest in establishing a chapter.",
      },
      {
        number: "02",
        title: "Initial discussion",
        description:
          "The federation reviews local context, chapter scope and community need.",
      },
      {
        number: "03",
        title: "Founding group",
        description:
          "A diverse and credible local working group is identified.",
      },
      {
        number: "04",
        title: "Local landscape review",
        description:
          "Existing Tamil organisations, institutions and stakeholders are considered respectfully.",
      },
      {
        number: "05",
        title: "Governance preparation",
        description:
          "Roles, responsibilities, decision-making and conflict-of-interest expectations are defined.",
      },
      {
        number: "06",
        title: "Chapter proposal",
        description: "A documented proposal is prepared for review.",
      },
      {
        number: "07",
        title: "Formation review",
        description:
          "The federation evaluates readiness, representation, governance and operating capacity.",
      },
      {
        number: "08",
        title: "Controlled chapter pilot",
        description:
          "An approved chapter begins with limited scope and accountable support.",
      },
      {
        number: "09",
        title: "Active chapter recognition",
        description:
          "Chapter recognition follows successful review of the pilot and operational readiness.",
      },
      {
        number: "10",
        title: "Ongoing review",
        description:
          "The chapter remains subject to reporting, renewal, support and governance expectations.",
      },
    ] as const satisfies readonly NumberedStatement[],
  },
  responsibilities: {
    eyebrow: "CHAPTER RESPONSIBILITIES",
    title: "A chapter should serve its community—not merely carry a name.",
    description:
      "Shared responsibilities keep local chapters accountable to community context and federation standards.",
    items: [
      "Maintain accurate chapter information",
      "Operate within approved scope",
      "Represent the federation responsibly",
      "Support local community participation",
      "Coordinate approved events and programs",
      "Work respectfully with existing organisations",
      "Protect member and participant information",
      "Maintain transparent local administration",
      "Report important activity and concerns",
      "Escalate safety, legal or governance issues",
      "Avoid political-party alignment in the federation’s name",
      "Communicate services and participation accurately",
    ],
  },
  governance: {
    eyebrow: "GOVERNANCE AND ACCOUNTABILITY",
    title: "Local trust requires clear governance and accountable leadership.",
    description:
      "Chapter recognition should rest on documented authority, fair participation, traceable administration and clear pathways for concern or review.",
    imageKey: "partnerships",
    principles: [
      {
        title: "Defined authority",
        description: "Every chapter role must have documented boundaries.",
      },
      {
        title: "Diverse participation",
        description:
          "Leadership structures should avoid control by one family, business or interest group.",
      },
      {
        title: "Conflict-of-interest disclosure",
        description:
          "Personal, organisational and commercial interests must be declared.",
      },
      {
        title: "Financial accountability",
        description:
          "Chapter funds require approved controls, records and reporting.",
      },
      {
        title: "Role-based administration",
        description:
          "Platform permissions must match assigned responsibilities.",
      },
      {
        title: "Auditability",
        description:
          "Important approvals, membership actions and administrative changes must be traceable.",
      },
      {
        title: "Complaints and escalation",
        description: "Community members need clear routes to raise concerns.",
      },
      {
        title: "Renewal and review",
        description:
          "Chapter recognition and leadership responsibilities should be reviewed periodically.",
      },
      {
        title: "Suspension and closure",
        description:
          "Serious governance or safety failures may require restriction, suspension or closure.",
      },
    ] as const satisfies readonly LabeledStatement[],
  },
  relationships: {
    eyebrow: "CHAPTERS, ORGANISATIONS AND MEMBERS",
    title: "Different roles, connected through one platform.",
    groups: [
      {
        title: "Chapters",
        items: [
          "Represent approved local federation structures",
          "Coordinate local participation",
          "Support chapter-level events and communication",
          "Operate within assigned geographic or community boundaries",
        ],
      },
      {
        title: "Organisations",
        items: [
          "Remain distinct institutions",
          "May register or seek verification separately",
          "May collaborate with chapters",
          "Retain their own governance and identity",
          "Are not automatically controlled by a chapter",
        ],
      },
      {
        title: "Members",
        items: [
          "Hold individual Tamil Ulagam membership where approved",
          "May be associated with a chapter",
          "May participate in organisations and events",
          "Retain privacy and visibility controls",
          "Are not automatically visible to every chapter administrator",
        ],
      },
    ],
    privacyStatement:
      "Chapter affiliation must not grant unrestricted access to private member information.",
    callToAction: {
      label: "Explore Tamil ID",
      href: "/tamil-id",
      variant: "text",
    },
  },
  statusModel: {
    eyebrow: "CHAPTER STATUS MODEL",
    title:
      "Chapter status should be clear, current and publicly understandable.",
    description:
      "A public directory distinguishes recognised chapters, chapters under formation, and paused, suspended or closed chapters without misrepresenting a location.",
    statuses: [
      "Interest gathering",
      "Initial discussion",
      "Founding group",
      "Proposal in preparation",
      "Under review",
      "Pilot",
      "Active",
      "Paused",
      "Suspended",
      "Closed",
    ],
  },
  directory: {
    eyebrow: "GLOBAL CHAPTER NETWORK",
    title: "Chapter regions across the Tamil world.",
    description:
      "Tamil communities across these regions express the global reach of the chapter vision and its local relevance.",
    areas: [
      "India",
      "Sri Lanka",
      "Malaysia",
      "Singapore",
      "United Kingdom and Europe",
      "North America",
      "Australia and New Zealand",
      "Gulf countries",
    ],
  },
  readiness: {
    eyebrow: "RESPONSIBLE CHAPTER FOUNDATIONS",
    title:
      "Every chapter needs the people, standards and capacity to serve responsibly.",
    requirements: [
      "Genuine community need",
      "Representative founding group",
      "Respect for existing organisations",
      "Clear local operating scope",
      "Defined leadership responsibilities",
      "Governance and conflict controls",
      "Administrative capacity",
      "Privacy and security controls",
      "Local legal and regulatory awareness",
      "Sustainable event and program capacity",
      "Communication and support processes",
      "Federation review and approval",
    ],
    statement:
      "Tamil Ulagam should not announce chapters simply to fill a world map.",
    callToAction: {
      label: "View the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  },
  interest: {
    eyebrow: "CHAPTER PARTICIPATION",
    title: "Help shape responsible local connection.",
    description:
      "Individuals and organisations can contribute local knowledge, governance experience, institutional perspective and programme support.",
    areas: [
      "Joining a founding discussion",
      "Sharing knowledge of the local Tamil community",
      "Representing an existing Tamil organisation",
      "Supporting governance or administration",
      "Helping with culture, education, events or professional networks",
      "Discussing institutional collaboration",
    ],
    primaryCallToAction: {
      label: "Contact Tamil Ulagam",
      href: "/contact",
      variant: "primary",
    },
    secondaryCallToAction: {
      label: "Partnership Vision",
      href: "/partners",
      variant: "secondary",
    },
    textCallToAction: {
      label: "Learn About Tamil Ulagam",
      href: "/about",
      variant: "text",
    },
  },
  faqs: [
    {
      title: "What does the chapter-region list represent?",
      description:
        "It expresses the global reach of the chapter vision without claiming an operating chapter or chapter count.",
    },
    {
      title: "How is a Tamil Ulagam chapter recognised?",
      description:
        "Recognition requires a representative founding group, clear local purpose and federation governance review.",
    },
    {
      title: "Will chapters replace existing Tamil organisations?",
      description:
        "No. Chapters are intended to collaborate with and complement existing organisations.",
    },
    {
      title: "Who will lead a chapter?",
      description:
        "Each chapter requires representative leadership, defined responsibility and accountable governance.",
    },
    {
      title: "How can I express interest?",
      description:
        "Use the Contact or Partners page to begin a chapter conversation.",
    },
  ] as const satisfies readonly ChaptersFaq[],
  finalCallToAction: {
    eyebrow: "BUILDING LOCAL CONNECTION RESPONSIBLY",
    title:
      "A trusted global federation begins with accountable local communities.",
    description:
      "Tamil Ulagam welcomes thoughtful discussion with Tamil organisations, community leaders, professionals and institutions interested in responsible local collaboration.",
    primaryCallToAction: {
      label: "Contact Tamil Ulagam",
      href: "/contact",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Partner With Us",
      href: "/partners",
      variant: "text",
    },
    textCallToAction: {
      label: "Explore the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  },
} as const;
