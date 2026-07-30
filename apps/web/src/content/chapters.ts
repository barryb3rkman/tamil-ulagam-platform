import type { CallToAction } from "@tamil-ulagam/shared";

import type { ImageKey } from "@/config/images";

type ChaptersImageKey = Extract<ImageKey, "globalChapters" | "partnerships">;

interface ChaptersHeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
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
    eyebrow: "PLANNED GLOBAL CHAPTER NETWORK",
    title: "Local communities. One global federation.",
    description:
      "Tamil Ulagam chapters are envisioned as trusted local connections between Tamil communities, organisations and the wider global platform.",
    status: "Building the Foundation",
    caption: "Conceptual representation of a future global chapter network.",
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
      "A future Tamil Ulagam chapter is intended to be a recognised local unit of the federation: locally relevant, globally aligned and accountable to clear shared standards.",
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
      "The future model separates global standards from local responsibility so that community participation can remain relevant, accountable and connected.",
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
    eyebrow: "PROPOSED CHAPTER-FORMATION JOURNEY",
    title: "A careful path from local interest to an accountable chapter.",
    description:
      "This proposed formation journey is a design for responsible introduction. It is not an application process currently accepting submissions.",
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
          "The federation reviews the local context, proposed scope and community need.",
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
    eyebrow: "PROPOSED CHAPTER RESPONSIBILITIES",
    title: "A chapter should serve its community—not merely carry a name.",
    description:
      "These are proposed responsibilities, subject to future governance approval and local operating context.",
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
      "Communicate planned and active services honestly",
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
          "Any future chapter funds require approved controls, records and reporting.",
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
    eyebrow: "PROPOSED CHAPTER STATUS MODEL",
    title:
      "Chapter status should be clear, current and publicly understandable.",
    description:
      "A future public directory should clearly distinguish planned chapters, chapters under formation, approved active chapters, and inactive or suspended chapters without implying a real location at this stage.",
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
    eyebrow: "FUTURE CHAPTER DIRECTORY",
    title: "A future directory designed for honest discovery.",
    description:
      "When governance and chapter operations are ready, a directory may help visitors understand the current status and approved public information for a chapter without presenting speculative location data today.",
    status: "Planned directory",
    areas: [
      "Country",
      "Region",
      "City",
      "Chapter name",
      "Current status",
      "Approved chapter description",
      "Chapter contact route",
      "Verified organisations connected with the chapter",
      "Future chapter events",
      "Public chapter announcements",
      "Accessibility and language information",
    ],
  },
  readiness: {
    eyebrow: "BUILT IN STAGES",
    title: "A chapter should launch only when it can operate responsibly.",
    requirements: [
      "Genuine community need",
      "Representative founding group",
      "Respect for existing organisations",
      "Clear local operating scope",
      "Defined leadership responsibilities",
      "Governance and conflict controls",
      "Administrative capacity",
      "Privacy and security readiness",
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
    eyebrow: "REGISTER INTEREST",
    title: "Interested in helping shape a future local chapter?",
    description:
      "Individuals and organisations may eventually express interest in contributing local knowledge, governance experience, institutional perspective or program support.",
    areas: [
      "Joining a founding discussion",
      "Sharing knowledge of the local Tamil community",
      "Representing an existing Tamil organisation",
      "Supporting governance or administration",
      "Helping with culture, education, events or professional networks",
      "Discussing institutional collaboration",
    ],
    notice: "Chapter applications are not currently open.",
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
      title: "Are Tamil Ulagam chapters currently active?",
      description:
        "No active chapter directory is being presented at this stage. The page explains the planned chapter model.",
    },
    {
      title: "Can an individual create a chapter immediately?",
      description:
        "No. Any future chapter formation will require an approved process, representative founding group and governance review.",
    },
    {
      title: "Will chapters replace existing Tamil organisations?",
      description:
        "No. Chapters are intended to collaborate with and complement existing organisations.",
    },
    {
      title: "Can an organisation become a chapter?",
      description:
        "Organisation registration and chapter recognition are separate concepts. The future process must define how organisations may participate.",
    },
    {
      title: "Will every country have one chapter?",
      description:
        "Geographic and organisational structures have not been finalised. Some locations may eventually require country, regional or city-level arrangements.",
    },
    {
      title: "Who will lead a chapter?",
      description:
        "Leadership models and eligibility rules must be approved before chapter formation begins.",
    },
    {
      title: "Will chapters collect membership fees?",
      description:
        "Financial responsibilities, membership pricing and chapter funding rules have not been finalised publicly.",
    },
    {
      title: "Can chapter administrators view all member data?",
      description:
        "No. Future access must be limited by role, responsibility, privacy policy and member visibility rules.",
    },
    {
      title: "How will chapter disputes be handled?",
      description:
        "Future governance must include complaints, escalation, review and appeal pathways.",
    },
    {
      title: "How can I express interest?",
      description:
        "Visitors may currently use the Contact or Partners pages to begin a discussion.",
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
