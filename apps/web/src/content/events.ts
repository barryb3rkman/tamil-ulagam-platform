import type { CallToAction } from "@tamil-ulagam/shared";

import type { ImageKey } from "@/config/images";

type EventsImageKey = Extract<ImageKey, "initiativeGlobalEvents">;

interface EventsHeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly caption: string;
  readonly imageKey: EventsImageKey;
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

interface ContentGroup {
  readonly title: string;
  readonly items: readonly string[];
}

interface EventsFaqItem {
  readonly title: string;
  readonly description: string;
}

export const eventsContent = {
  hero: {
    eyebrow: "GLOBAL EVENTS",
    title: "Bringing communities together through trusted events.",
    description:
      "Tamil Ulagam connects members, chapters, organisations and communities through cultural, educational, professional and global programmes.",
    caption: "Tamil Ulagam events and community participation across borders.",
    imageKey: "initiativeGlobalEvents",
    primaryCallToAction: {
      label: "Understand the Events Model",
      href: "/events#events-model",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Explore Global Events Vision",
      href: "/initiatives/global-events",
      variant: "text",
    },
  } satisfies EventsHeroContent,
  definition: {
    eyebrow: "WHAT THE EVENTS PLATFORM IS",
    title:
      "One place to discover approved events, understand participation and stay connected.",
    description:
      "Trusted event information, participation pathways and community communication belong in one accountable public experience.",
    capabilities: [
      "Public event discovery",
      "Member event discovery",
      "Federation programs",
      "Chapter events",
      "Organisation events",
      "Cultural performances",
      "Education and research programs",
      "Professional summits",
      "Community gatherings",
      "Hybrid and virtual participation",
      "Participation and registration guidance",
      "Recordings and archives",
    ],
    statement:
      "Clear purpose, accountable organisers and respectful participation shape every Tamil Ulagam event experience.",
    principles: [
      {
        title: "Trusted discovery",
        description:
          "Public information should help people understand an approved event without overstating its scope.",
      },
      {
        title: "Clear participation",
        description:
          "Registration, attendance and access expectations should be explicit for every real event.",
      },
      {
        title: "Accountable ownership",
        description:
          "Each event needs a responsible organiser, defined permissions and escalation route.",
      },
      {
        title: "Respectful community experience",
        description:
          "Safety, accessibility, language and privacy should shape the experience from the start.",
      },
    ] as const satisfies readonly LabeledStatement[],
  },
  categories: {
    eyebrow: "GLOBAL CELEBRATIONS",
    title: "Annual celebrations across the Tamil world.",
    items: [
      {
        title: "Tamil Ulagam Day",
        description:
          "An annual celebration connecting Tamil communities worldwide.",
      },
      {
        title: "Pongal celebrations",
        description:
          "Community and chapter celebrations rooted in local Tamil culture.",
      },
      {
        title: "Tamil New Year gala",
        description:
          "A cultural gathering celebrating renewal, community and Tamil identity.",
      },
      {
        title: "Global Tamil Summit",
        description:
          "A global forum for community, institutional and professional connection.",
      },
      {
        title: "Tamil Heritage Month",
        description:
          "Cultural, educational and community programming centred on Tamil heritage.",
      },
      {
        title: "Tamil Ulagam Awards Night",
        description:
          "A celebration of Tamil contribution across culture, knowledge, enterprise and community life.",
      },
    ] as const satisfies readonly LabeledStatement[],
  },
  organisers: {
    eyebrow: "WHO MAY ORGANISE EVENTS",
    title: "Event publishing requires accountable organisers.",
    categories: [
      "Tamil Ulagam federation teams",
      "Approved chapters",
      "Verified Tamil organisations",
      "Educational institutions",
      "Research institutions",
      "Cultural institutions",
      "Professional bodies",
      "Healthcare and wellbeing organisations",
      "Responsible business networks",
      "Approved event partners",
      "Authorised program teams",
    ],
    statement:
      "Being listed as a possible organiser category does not represent approval or an existing relationship.",
    limitations: [
      "Geography",
      "Event type",
      "Chapter",
      "Organisation",
      "Initiative",
      "Duration",
      "Audience",
      "Risk level",
    ],
  },
  organiserPathway: {
    eyebrow: "ORGANISER PATHWAY",
    title: "A careful route from organiser interest to publishing authority.",
    description:
      "The organiser pathway connects verified ownership, clear scope and responsible publishing authority.",
    steps: [
      {
        number: "01",
        title: "Initial interest",
        description: "An organisation or authorised team begins a discussion.",
      },
      {
        number: "02",
        title: "Identity verification",
        description:
          "Organisational identity and authorised representatives are reviewed.",
      },
      {
        number: "03",
        title: "Purpose and scope",
        description:
          "Event categories, audience and intended activity are clarified.",
      },
      {
        number: "04",
        title: "Governance review",
        description:
          "Ownership, moderation, safeguarding and escalation responsibilities are considered.",
      },
      {
        number: "05",
        title: "Publishing permissions",
        description: "Approved roles and boundaries are defined.",
      },
      {
        number: "06",
        title: "Controlled onboarding",
        description:
          "Organisers receive only the permissions needed for their approved scope.",
      },
      {
        number: "07",
        title: "Initial event review",
        description:
          "Early event submissions may require additional administrative review.",
      },
      {
        number: "08",
        title: "Ongoing monitoring",
        description:
          "Accuracy, safety, communication and policy compliance are reviewed.",
      },
      {
        number: "09",
        title: "Renewal, restriction or closure",
        description:
          "Organiser permissions may be renewed, limited, suspended or removed.",
      },
    ] as const satisfies readonly NumberedStatement[],
  },
  lifecycle: {
    eyebrow: "CONCEPTUAL EVENT LIFECYCLE",
    title:
      "Every published event should have a clear and accountable lifecycle.",
    description:
      "Clear operating states keep event ownership, publication and participation understandable.",
    steps: [
      {
        number: "01",
        title: "Draft",
        description: "Event details are prepared but remain private.",
      },
      {
        number: "02",
        title: "Submitted",
        description:
          "The organiser submits the event for review where required.",
      },
      {
        number: "03",
        title: "Under review",
        description:
          "Content, organiser authority, safety and accuracy are considered.",
      },
      {
        number: "04",
        title: "Clarification requested",
        description:
          "Missing or unclear information is returned to the organiser.",
      },
      {
        number: "05",
        title: "Approved",
        description:
          "The event is approved for publication, subject to its approved scope.",
      },
      {
        number: "06",
        title: "Scheduled",
        description:
          "The event becomes publicly discoverable when publication timing is appropriate.",
      },
      {
        number: "07",
        title: "Registration open",
        description:
          "Registration may be enabled only when the event supports it and the system is ready.",
      },
      {
        number: "08",
        title: "Registration closed",
        description: "New registrations stop according to event rules.",
      },
      {
        number: "09",
        title: "In progress",
        description: "The event is currently taking place.",
      },
      {
        number: "10",
        title: "Completed",
        description: "The event has concluded.",
      },
      {
        number: "11",
        title: "Archived",
        description:
          "Approved public information or recordings may remain available.",
      },
      {
        number: "12",
        title: "Cancelled",
        description: "The event will not proceed.",
      },
      {
        number: "13",
        title: "Postponed",
        description: "The event is awaiting a revised schedule.",
      },
    ] as const satisfies readonly NumberedStatement[],
  },
  registration: {
    eyebrow: "REGISTRATION AND ATTENDANCE",
    title:
      "Registration should be clear, minimal and appropriate to each event.",
    models: [
      "Public registration",
      "Member-only registration",
      "Invitation-only participation",
      "Chapter-specific participation",
      "Organisation-specific participation",
      "Free events",
      "Paid events subject to approved payment policy",
      "Waitlists",
      "Capacity limits",
      "Hybrid attendance",
      "Virtual attendance",
      "No-registration public programs",
    ],
    principles: [
      "Collect only necessary attendee information.",
      "Display eligibility clearly.",
      "Show cost, refund and cancellation terms before confirmation.",
      "Avoid hidden fees.",
      "Separate registration from attendance confirmation.",
      "Protect minors through approved safeguarding rules.",
      "Provide accessibility and support information.",
      "Record important status changes.",
      "Support accountable cancellation and refund processes when payments are introduced.",
    ],
  },
  privacy: {
    eyebrow: "PUBLIC INFORMATION AND ATTENDEE PRIVACY",
    title:
      "Useful event discovery should not expose unnecessary personal information.",
    publicInformation: [
      "Event title",
      "Approved organiser",
      "Event category",
      "Description",
      "Date and time when real events exist",
      "Location or virtual format",
      "Language",
      "Accessibility information",
      "Registration status",
      "Approved speakers or performers",
      "Cancellation or postponement status",
      "Public contact route",
    ],
    privateInformation: [
      "Member or attendee identity",
      "Contact information",
      "Registration responses",
      "Accessibility requests",
      "Payment status where applicable",
      "Attendance status",
      "Consent records",
      "Private support requests",
      "Administrative notes",
    ],
    statement:
      "Event organisers and chapter administrators must not receive unrestricted access to attendee or member data.",
    description:
      "Access should be role-based, purpose-limited and subject to approved policy.",
    callToAction: {
      label: "Explore Tamil ID",
      href: "/tamil-id",
      variant: "text",
    },
  },
  relationships: {
    eyebrow: "FEDERATION, CHAPTER AND ORGANISATION EVENTS",
    title: "Different organisers. Shared standards. Clear responsibility.",
    groups: [
      {
        title: "Federation events",
        items: [
          "Approved global or federation-wide programs",
          "Central ownership",
          "Shared public communication",
          "Global participation where appropriate",
        ],
      },
      {
        title: "Chapter events",
        items: [
          "Future events within approved chapter scope",
          "Local relevance",
          "Local organiser accountability",
          "Chapter-specific permissions and moderation",
        ],
      },
      {
        title: "Organisation events",
        items: [
          "Events published by separately verified organisations",
          "Organisation identity remains distinct",
          "Publication does not imply chapter status",
          "Approval does not imply endorsement beyond the event’s defined scope",
        ],
      },
      {
        title: "Partner-supported events",
        items: [
          "Defined responsibilities",
          "Approved public wording",
          "Clear financial or sponsorship disclosures",
          "Controlled branding",
          "No automatic access to member data",
        ],
      },
    ] as const satisfies readonly ContentGroup[],
    statement:
      "Publishing an event must not give an organiser authority beyond that event’s approved scope.",
    callToActions: [
      { label: "Explore Chapters", href: "/chapters", variant: "text" },
      { label: "Explore Partners", href: "/partners", variant: "text" },
    ] as const satisfies readonly CallToAction[],
  },
  hybridArchive: {
    eyebrow: "HYBRID, VIRTUAL AND RECORDED EVENTS",
    title: "Participation may extend beyond a physical venue.",
    possibilities: [
      "Physical events",
      "Virtual events",
      "Hybrid events",
      "Livestream links",
      "Session recordings",
      "Event highlights",
      "Approved presentation materials",
      "Subtitles and language support",
      "Accessibility accommodations",
      "Time-zone communication",
      "Event archives",
    ],
    safeguards: [
      "Speaker and performer consent",
      "Recording permissions",
      "Copyright and media rights",
      "Attendee notice",
      "Minors and safeguarding rules",
      "Access control",
      "Recording retention policy",
      "Moderation",
      "Removal and correction pathways",
    ],
    statement:
      "Virtual access and recordings are part of the long-term vision, subject to consent, rights and technical readiness.",
  },
  statusModel: {
    eyebrow: "EVENT STATUS MODEL",
    title: "Event status should always be clear and current.",
    publicStatuses: [
      "Announced",
      "Registration required",
      "Registration open",
      "Registration closed",
      "Waitlist",
      "In progress",
      "Completed",
      "Postponed",
      "Cancelled",
      "Archived",
    ],
    administrativeStatuses: [
      "Draft",
      "Submitted",
      "Under review",
      "Clarification requested",
      "Approved",
      "Rejected",
      "Suspended",
      "Closed",
    ],
    statement:
      "Public visitors should not see internal administrative information unless policy permits it. Text labels must make every visible status understandable without colour alone.",
  },
  safety: {
    eyebrow: "SAFETY, ACCESSIBILITY AND MODERATION",
    title:
      "A successful event must be safe, accessible and responsibly managed.",
    principles: [
      "Verified organiser ownership",
      "Accurate event information",
      "Venue and safety information",
      "Safeguarding for minors",
      "Code of conduct",
      "Harassment reporting",
      "Emergency contacts where required",
      "Accessibility information",
      "Language support",
      "Content moderation",
      "Speaker and performer permissions",
      "Copyright and media controls",
      "Cancellation communication",
      "Incident escalation",
      "Post-event review",
    ],
    statement:
      "Tamil Ulagam should not publish events simply to make the platform appear active.",
  },
  readiness: {
    eyebrow: "RESPONSIBLE EVENT FOUNDATIONS",
    title:
      "The Events platform should open only when publishing and participation can be supported responsibly.",
    items: [
      "Approved event policy",
      "Defined organiser categories",
      "Organiser verification process",
      "Publishing and moderation workflow",
      "Registration privacy model",
      "Support ownership",
      "Cancellation and refund policy where payments apply",
      "Accessibility standards",
      "Safeguarding procedures",
      "Incident and complaints process",
      "Chapter and organisation permission boundaries",
      "Reliable notification delivery",
      "Auditability",
      "Controlled pilot plan",
      "Review and expansion criteria",
    ],
    callToAction: {
      label: "Join Tamil Ulagam",
      href: "/join",
      variant: "text",
    },
  },
  interest: {
    eyebrow: "BEGIN A CONVERSATION",
    title: "Interested in shaping responsible Tamil community events?",
    description:
      "Tamil Ulagam welcomes conversations about events that are useful, safe, inclusive and operationally credible.",
    areas: [
      "Federation programs",
      "Chapter events",
      "Educational events",
      "Cultural events",
      "Professional summits",
      "Healthcare awareness programs",
      "Research conferences",
      "Venue collaboration",
      "Accessibility",
      "Event operations",
      "Virtual participation",
      "Safety and safeguarding",
    ],
    primaryCallToAction: { label: "Contact Tamil Ulagam", href: "/contact" },
    secondaryCallToAction: {
      label: "Explore Partnerships",
      href: "/partners",
      variant: "secondary",
    },
    textCallToAction: {
      label: "Explore the Global Events Initiative",
      href: "/initiatives/global-events",
      variant: "text",
    },
  },
  faqs: [
    {
      title: "What kinds of events belong in Tamil Ulagam?",
      description:
        "Cultural celebrations, educational programmes, professional summits, research gatherings and community events all belong within the vision.",
    },
    {
      title: "How is event participation communicated?",
      description:
        "Each event experience should communicate its audience, access, participation and organiser responsibilities clearly.",
    },
    {
      title: "Will every event require registration?",
      description: "No. Participation requirements vary by event and audience.",
    },
    {
      title: "Will some events be paid?",
      description:
        "Any paid participation requires clear pricing, payment, cancellation and refund policies.",
    },
    {
      title: "Can organisations publish events?",
      description:
        "Verified organisations can participate within clearly approved scope and accountable publishing standards.",
    },
    {
      title: "How can an organiser begin a discussion?",
      description: "Use the Contact or Partners page to begin a conversation.",
    },
  ] as const satisfies readonly EventsFaqItem[],
  finalCallToAction: {
    eyebrow: "BUILDING TRUSTED COMMUNITY EXPERIENCES",
    title:
      "Meaningful events begin with clear purpose, responsible organisers and safe participation.",
    description:
      "Tamil Ulagam welcomes thoughtful conversations with organisations, chapters, institutions and professionals interested in credible global events.",
    primaryCallToAction: { label: "Contact Tamil Ulagam", href: "/contact" },
    secondaryCallToAction: {
      label: "Join Tamil Ulagam",
      href: "/join",
      variant: "text",
    },
    textCallToAction: {
      label: "Explore Global Events",
      href: "/initiatives/global-events",
      variant: "text",
    },
  },
} as const;
