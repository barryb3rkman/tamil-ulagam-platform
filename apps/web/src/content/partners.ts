import type { CallToAction } from "@tamil-ulagam/shared";

import type { ImageKey } from "@/config/images";

type PartnersImageKey = Extract<ImageKey, "partnerships">;

interface PartnersHeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly caption: string;
  readonly imageKey: PartnersImageKey;
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

interface PartnershipGroup {
  readonly title: string;
  readonly items: readonly string[];
}

export const partnersContent = {
  hero: {
    eyebrow: "PARTNERSHIP VISION",
    title: "Trusted collaboration for a connected global Tamil future.",
    description:
      "Tamil Ulagam welcomes responsible organisations, institutions and professionals whose expertise, integrity and community understanding can strengthen the platform’s long-term mission.",
    caption:
      "Responsible institutional collaboration across communities and sectors.",
    imageKey: "partnerships",
    primaryCallToAction: {
      label: "Explore the Partnership Model",
      href: "/partners#partnership-model",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "View the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  } satisfies PartnersHeroContent,
  definition: {
    eyebrow: "WHY PARTNERSHIPS MATTER",
    title:
      "A platform serving global communities cannot succeed through technology alone.",
    description:
      "Responsible collaboration brings the knowledge, safeguards and delivery capacity needed to make the platform useful and accountable.",
    principles: [
      "Community knowledge",
      "Professional expertise",
      "Institutional credibility",
      "Verified service supply",
      "Cultural context",
      "Educational and research capability",
      "Local operational understanding",
      "Governance guidance",
      "Trust and safety support",
      "Sustainable program delivery",
    ],
    strategicPrinciples: [
      {
        title: "Expertise before expansion",
        description:
          "Community value should be informed by relevant knowledge and capability.",
      },
      {
        title: "Verification before public association",
        description:
          "Public representation must follow appropriate review and approval.",
      },
      {
        title: "Clear scope before shared delivery",
        description:
          "Every collaboration needs an agreed purpose, boundary and owner.",
      },
      {
        title: "Accountability before access",
        description:
          "Permissions and information access must be necessary, controlled and reviewable.",
      },
      {
        title: "Community value before visibility",
        description:
          "Recognition should follow meaningful contribution, not appearance.",
      },
    ] as const satisfies readonly LabeledStatement[],
  },
  categories: {
    eyebrow: "WHO MAY COLLABORATE",
    title: "Different institutions can contribute in different ways.",
    items: [
      "Government and institutions",
      "Universities and research",
      "Tamil associations",
      "Corporate and CSR organisations",
      "Technology partners",
      "Media and community organisations",
    ],
    statement:
      "These categories reflect distinct forms of knowledge, capability and community contribution.",
  },
  collaborationModels: {
    eyebrow: "FORMS OF COLLABORATION",
    title:
      "Collaboration should be defined by purpose, responsibility and measurable value.",
    models: [
      {
        number: "01",
        title: "Knowledge contribution",
        description:
          "Subject-matter expertise, research, educational material or cultural knowledge.",
      },
      {
        number: "02",
        title: "Community and institutional programmes",
        description:
          "Education, healthcare, culture, research and community initiatives with confirmed organisations.",
      },
      {
        number: "03",
        title: "Technology and media collaboration",
        description:
          "Responsible platform, communication and public-awareness support.",
      },
      {
        number: "04",
        title: "Corporate and CSR collaboration",
        description:
          "Support for clearly defined community goals under approved agreements.",
      },
    ] as const satisfies readonly NumberedStatement[],
  },
  boundaries: {
    eyebrow: "WHAT PARTNERSHIP DOES NOT MEAN",
    title: "A conversation is not an endorsement, contract or approval.",
    items: [
      "Official partner status",
      "Public logo placement",
      "Access to member data",
      "Access to Tamil ID systems",
      "Administrative permissions",
      "Exclusive rights",
      "Procurement commitments",
      "Financial guarantees",
      "Endorsement of products or services",
      "Access to chapters or organisations",
      "Permission to speak on behalf of Tamil Ulagam",
      "Permission to use Tamil Ulagam branding",
    ],
    statement:
      "Public discussion or inclusion does not imply endorsement, contract or confirmed partnership.",
  },
  pathway: {
    eyebrow: "PARTNERSHIP PATHWAY",
    title: "A careful path from initial interest to accountable collaboration.",
    description:
      "The partnership pathway connects shared purpose, responsible review and accountable collaboration.",
    steps: [
      {
        number: "01",
        title: "Initial interest",
        description: "An organisation or professional begins a conversation.",
      },
      {
        number: "02",
        title: "Purpose and alignment discussion",
        description:
          "Both parties explore community value, goals and broad compatibility.",
      },
      {
        number: "03",
        title: "Scope definition",
        description:
          "Responsibilities, beneficiaries, geography and intended outcomes are clarified.",
      },
      {
        number: "04",
        title: "Preliminary review",
        description:
          "Public records, organisational identity and authorised representatives are considered.",
      },
      {
        number: "05",
        title: "Due diligence",
        description:
          "Governance, legal status, reputation, capability, risks and conflicts are reviewed.",
      },
      {
        number: "06",
        title: "Operating model",
        description:
          "Ownership, data access, administration, support and escalation routes are defined.",
      },
      {
        number: "07",
        title: "Proposal and approvals",
        description:
          "A documented proposal is reviewed by authorised decision-makers.",
      },
      {
        number: "08",
        title: "Agreement",
        description:
          "Approved collaboration is documented with scope, responsibilities and limitations.",
      },
      {
        number: "09",
        title: "Controlled delivery",
        description:
          "Work begins within the approved scope, often through a limited pilot.",
      },
      {
        number: "10",
        title: "Monitoring and review",
        description:
          "Progress, risk, quality and community value are reviewed.",
      },
      {
        number: "11",
        title: "Renewal, change or closure",
        description:
          "The relationship may be renewed, changed, paused or ended through accountable processes.",
      },
    ] as const satisfies readonly NumberedStatement[],
  },
  dueDiligence: {
    eyebrow: "DUE DILIGENCE AND VERIFICATION",
    title: "Trust requires more than a promising conversation.",
    description:
      "These review areas establish whether a collaboration has the identity, safeguards and capacity appropriate to its intended scope.",
    items: [
      "Legal identity",
      "Authorised representatives",
      "Governance structure",
      "Organisational track record",
      "Financial and operational stability where relevant",
      "Safeguarding and safety history",
      "Privacy and security practices",
      "Conflicts of interest",
      "Sanctions or regulatory concerns where relevant",
      "Public reputation",
      "Service quality",
      "Insurance or professional credentials where required",
      "Media, copyright and data rights",
      "Capacity to deliver the agreed scope",
    ],
  },
  governance: {
    eyebrow: "GOVERNANCE, OWNERSHIP AND DATA ACCESS",
    title: "Every collaboration needs clear boundaries.",
    groups: [
      {
        title: "Ownership",
        items: [
          "Named owner for each partnership",
          "Defined responsibilities",
          "Approved decision-makers",
          "Documented escalation routes",
        ],
      },
      {
        title: "Scope",
        items: [
          "Clear permitted activities",
          "Defined locations, initiatives or programs",
          "Approved communication rights",
          "Explicit exclusions",
        ],
      },
      {
        title: "Data access",
        items: [
          "No automatic member-data access",
          "Minimum necessary access",
          "Role-based permissions",
          "Purpose limitation",
          "Auditability",
          "Secure removal when access is no longer required",
        ],
      },
      {
        title: "Brand and communication",
        items: [
          "No public announcement without approval",
          "Approved wording and logo use",
          "Accurate status descriptions",
          "No exaggerated claims",
        ],
      },
      {
        title: "Financial and commercial terms",
        items: [
          "Transparent agreements",
          "Approved payment or sponsorship controls",
          "Conflict-of-interest disclosure",
          "No hidden commissions or implied guarantees",
        ],
      },
    ] as const satisfies readonly PartnershipGroup[],
    privacyStatement:
      "Partnership status must never grant unrestricted access to member, chapter or organisation data.",
    callToAction: {
      label: "Explore Tamil ID",
      href: "/tamil-id",
      variant: "text",
    },
  },
  statusModel: {
    eyebrow: "PARTNERSHIP STATUS MODEL",
    title:
      "Partnership status should be clear, current and publicly verifiable.",
    description:
      "Only confirmed public relationships belong in a partner directory. Discussion, agreed partnership, delivery, and paused or closed relationships remain distinct.",
    statuses: [
      "Interest received",
      "Initial discussion",
      "Scope exploration",
      "Preliminary review",
      "Due diligence",
      "Proposal under review",
      "Under review",
      "Approved",
      "Active",
      "Paused",
      "Suspended",
      "Completed",
      "Closed",
    ],
    statement:
      "No status on this page applies to a real organisation or represents an existing partnership.",
  },
  initiatives: {
    eyebrow: "COLLABORATION ACROSS INITIATIVES",
    title:
      "Partnerships may support different parts of one connected ecosystem.",
    groups: [
      {
        title: "Human development",
        items: ["Healthcare", "Education"],
        callToAction: {
          label: "Explore Human Development",
          href: "/initiatives",
          variant: "text",
        },
      },
      {
        title: "Opportunity and economy",
        items: [
          "Business Networking",
          "Jobs and Careers",
          "Tourism and Hospitality",
        ],
        callToAction: {
          label: "Explore Opportunity",
          href: "/initiatives/business",
          variant: "text",
        },
      },
      {
        title: "Knowledge, culture and global presence",
        items: [
          "Research and Innovation",
          "Arts, Music and Culture",
          "Global Events",
        ],
        callToAction: {
          label: "Explore Knowledge and Culture",
          href: "/initiatives/research",
          variant: "text",
        },
      },
      {
        title: "Platform foundation",
        items: [
          "Membership and Tamil ID",
          "Chapters and organisations",
          "Privacy and security",
          "Technology and operations",
          "Accessibility and language",
          "Governance and administration",
        ],
        callToAction: {
          label: "Explore the Roadmap",
          href: "/roadmap",
          variant: "text",
        },
      },
    ] as const satisfies readonly (PartnershipGroup & {
      readonly callToAction: CallToAction;
    })[],
  },
  readiness: {
    eyebrow: "RESPONSIBLE COLLABORATION",
    title: "A partnership should begin only when responsibility is clear.",
    items: [
      "Genuine community value",
      "Clear purpose and scope",
      "Verified organisation and representatives",
      "Named operational ownership",
      "Governance and approval controls",
      "Privacy and security review",
      "Data-access boundaries",
      "Safeguarding and risk review",
      "Financial transparency where relevant",
      "Support and escalation routes",
      "Measurable outcomes",
      "Exit and closure provisions",
    ],
    statement:
      "Tamil Ulagam should not announce partnerships simply to create the appearance of institutional support.",
    callToAction: {
      label: "View the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  },
  interest: {
    eyebrow: "BEGIN A CONVERSATION",
    title: "Interested in exploring responsible collaboration?",
    description:
      "Organisations and professionals may begin a discussion around community, culture, knowledge, opportunity and responsible platform development.",
    areas: [
      "Community initiatives",
      "Chapter collaboration",
      "Education and research",
      "Healthcare and wellbeing",
      "Business and career networks",
      "Culture and heritage",
      "Events and programs",
      "Technology and operations",
      "Privacy, governance and accessibility",
    ],
    primaryCallToAction: {
      label: "Contact Tamil Ulagam",
      href: "/contact",
      variant: "primary",
    },
    secondaryCallToAction: {
      label: "Explore Initiatives",
      href: "/initiatives",
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
      title: "How are public partnerships represented?",
      description:
        "A public relationship requires appropriate review, written agreement and clearly defined scope.",
    },
    {
      title: "Does contacting Tamil Ulagam create a partnership?",
      description: "No. Contact begins only an initial discussion.",
    },
    {
      title:
        "Can an organisation display the Tamil Ulagam logo after a discussion?",
      description: "No. Public branding requires explicit written approval.",
    },
    {
      title: "Will partners receive member data?",
      description:
        "No automatic access is provided. Any access must be necessary, approved, limited and auditable.",
    },
    {
      title: "Can Tamil organisations collaborate without becoming chapters?",
      description:
        "Yes. Organisation collaboration and chapter recognition are separate concepts.",
    },
    {
      title: "How can an organisation begin?",
      description: "Use the Contact page to begin a discussion.",
    },
  ] as const satisfies readonly LabeledStatement[],
  finalCallToAction: {
    eyebrow: "BUILDING TRUSTED RELATIONSHIPS",
    title:
      "Strong partnerships begin with shared purpose and clear responsibility.",
    description:
      "Tamil Ulagam welcomes thoughtful conversations with organisations and professionals who can contribute responsibly to community, culture, knowledge and opportunity.",
    primaryCallToAction: {
      label: "Contact Tamil Ulagam",
      href: "/contact",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Explore the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
    textCallToAction: {
      label: "Explore Initiatives",
      href: "/initiatives",
      variant: "text",
    },
  },
} as const;
