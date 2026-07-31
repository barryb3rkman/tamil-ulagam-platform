import type { CallToAction } from "@tamil-ulagam/shared";

import type { ImageKey } from "@/config/images";

type NewsImageKey = Extract<ImageKey, "communityStories">;

interface HeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly caption: string;
  readonly imageKey: NewsImageKey;
  readonly primaryCallToAction: CallToAction;
  readonly secondaryCallToAction: CallToAction;
}

interface Statement {
  readonly title: string;
  readonly description: string;
}

interface NumberedStatement extends Statement {
  readonly number: string;
}

interface TextSection {
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: string;
}

interface FaqItem {
  readonly title: string;
  readonly description: string;
}

export const newsContent = {
  hero: {
    eyebrow: "PLANNED PUBLIC NEWSROOM",
    title: "Trusted updates. Meaningful stories. A clear public record.",
    description:
      "Tamil Ulagam’s future newsroom is intended to publish verified announcements, thoughtful community stories, initiative updates and knowledge with clear ownership and responsible editorial review.",
    status: "Editorial Foundation in Development",
    caption:
      "Conceptual representation of future Tamil Ulagam editorial storytelling. No published story is represented.",
    imageKey: "communityStories",
    primaryCallToAction: {
      label: "Understand the Editorial Model",
      href: "/news#editorial-model",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Explore Community Stories Vision",
      href: "/about",
      variant: "text",
    },
  } satisfies HeroContent,
  definition: {
    eyebrow: "WHAT THE NEWSROOM IS",
    title:
      "A trusted public space for updates, stories, knowledge and accountability.",
    description:
      "The future newsroom may provide a clear, responsibly maintained public record for information that matters to Tamil communities and the wider federation.",
    capabilities: [
      "Official federation announcements",
      "Public platform updates",
      "Policy and governance notices",
      "Initiative progress",
      "Verified chapter and organisation updates",
      "Community stories with consent",
      "Research and knowledge features",
      "Tamil language and cultural content",
      "Event reporting and archives",
      "Corrections and public updates",
      "Long-term public records",
    ],
    statement:
      "No approved public articles are currently presented on this page. It describes the future editorial model rather than displaying placeholder news.",
    principles: [
      {
        title: "Public value",
        description:
          "Each future publication should have a clear purpose for its intended public audience.",
      },
      {
        title: "Responsible ownership",
        description:
          "Institutional and editorial responsibility should be clear before publication begins.",
      },
      {
        title: "Clear context",
        description:
          "Readers should be able to understand what a publication is, why it exists and how current it remains.",
      },
      {
        title: "Accountable record",
        description:
          "Corrections, updates, archives and withdrawals should be handled transparently.",
      },
    ] as const satisfies readonly Statement[],
  },
  publicationTypes: {
    eyebrow: "WHAT MAY BE PUBLISHED",
    title: "Different content types serve different public purposes.",
    items: [
      {
        title: "Federation announcements",
        description:
          "Approved updates concerning Tamil Ulagam’s public direction, governance, platform or operations.",
      },
      {
        title: "Platform updates",
        description:
          "Honest information about development progress, availability and important changes.",
      },
      {
        title: "Initiative updates",
        description:
          "Approved progress relating to healthcare, education, business, careers, research, tourism, culture or global events.",
      },
      {
        title: "Chapter and organisation updates",
        description:
          "Verified public updates from approved chapters or organisations within defined scope.",
      },
      {
        title: "Community stories",
        description:
          "Human-centred stories published with consent, dignity and appropriate safeguarding.",
      },
      {
        title: "Research and knowledge",
        description:
          "Educational, historical, academic and evidence-based public material.",
      },
      {
        title: "Language, culture and heritage",
        description:
          "Tamil language, arts, literature, history, archives and cultural knowledge.",
      },
      {
        title: "Event coverage",
        description:
          "Approved reporting, recordings or summaries from real published events.",
      },
      {
        title: "Public notices",
        description:
          "Service status, policy changes, corrections, maintenance or other necessary public communication.",
      },
      {
        title: "Editorial features",
        description:
          "Carefully reviewed interviews, analysis or long-form public-interest content.",
      },
    ] as const satisfies readonly Statement[],
  },
  distinctions: {
    eyebrow: "EDITORIAL DISTINCTIONS",
    title: "Every publication should make its purpose clear.",
    items: [
      {
        title: "Official announcement",
        description:
          "An institutional update with approved organisational ownership and clear effective information for governance, platform or policy communication.",
      },
      {
        title: "News update",
        description:
          "A timely, factual development with sources identified internally and updates made when circumstances change.",
      },
      {
        title: "Community story",
        description:
          "A human-centred narrative requiring consent and safeguarding; it is not presented as a formal institutional announcement.",
      },
      {
        title: "Knowledge resource",
        description:
          "Educational or reference-focused material with sources and attribution that may remain useful over a longer period.",
      },
      {
        title: "Editorial or interview",
        description:
          "A clearly identified format with disclosed contributors, opinion separated from verified fact, and quotations used with permission and context.",
      },
      {
        title: "Public notice",
        description:
          "Concise operational communication with visible status and effective information, corrected or archived when no longer current.",
      },
    ] as const satisfies readonly Statement[],
  },
  principles: {
    eyebrow: "EDITORIAL PRINCIPLES",
    title: "Public trust depends on disciplined editorial standards.",
    statement:
      "Tamil Ulagam should not publish content simply to make the newsroom appear active.",
    items: [
      "Accuracy before speed",
      "Clear institutional ownership",
      "Source verification",
      "Fact and opinion separation",
      "Consent and dignity",
      "Responsible attribution",
      "Privacy and data minimisation",
      "Cultural and linguistic care",
      "Accessible publishing",
      "Transparent corrections",
      "Conflict-of-interest disclosure",
      "Honest publication status",
      "No invented evidence or quotations",
      "No misleading availability claims",
    ],
  },
  workflow: {
    eyebrow: "PROPOSED PUBLISHING WORKFLOW",
    title: "A careful path from editorial idea to accountable public record.",
    description:
      "This proposed workflow describes how future material may move through responsible review before and after publication.",
    label: "Proposed publishing workflow",
    steps: [
      {
        number: "01",
        title: "Editorial idea or verified update",
        description: "A potential publication need is identified.",
      },
      {
        number: "02",
        title: "Ownership assigned",
        description:
          "A responsible editor, team or authorised institutional owner is named.",
      },
      {
        number: "03",
        title: "Scope and audience",
        description:
          "Purpose, intended audience, format and public value are clarified.",
      },
      {
        number: "04",
        title: "Research and source collection",
        description:
          "Relevant documents, interviews and evidence are gathered.",
      },
      {
        number: "05",
        title: "Drafting",
        description:
          "Content is written without publishing unverified claims as fact.",
      },
      {
        number: "06",
        title: "Fact-checking",
        description:
          "Names, facts, quotations, links, dates and assertions are reviewed.",
      },
      {
        number: "07",
        title: "Privacy and safeguarding review",
        description:
          "Personal information, consent, minors, sensitive subjects and safety concerns are considered.",
      },
      {
        number: "08",
        title: "Cultural and language review",
        description:
          "Tamil and English wording, context and translation quality are reviewed where relevant.",
      },
      {
        number: "09",
        title: "Legal or policy review",
        description:
          "Copyright, defamation, confidentiality, institutional policy and other risks are considered where needed.",
      },
      {
        number: "10",
        title: "Editorial approval",
        description:
          "An authorised editor approves, returns or rejects the draft.",
      },
      {
        number: "11",
        title: "Accessibility preparation",
        description:
          "Heading structure, alt text, captions, transcripts and readable presentation are confirmed.",
      },
      {
        number: "12",
        title: "Scheduling or publication",
        description: "Approved content is published at the appropriate time.",
      },
      {
        number: "13",
        title: "Post-publication monitoring",
        description:
          "Errors, changes, responses or safety concerns are reviewed.",
      },
      {
        number: "14",
        title: "Correction, update, withdrawal or archive",
        description: "The public record is maintained transparently.",
      },
    ] as const satisfies readonly NumberedStatement[],
  },
  verification: {
    eyebrow: "SOURCES, FACT-CHECKING AND VERIFICATION",
    title: "A credible publication should show how its claims can be trusted.",
    label: "Proposed source and verification standards",
    items: [
      "Distinguish firsthand, documentary and secondary sources",
      "Verify names, roles and organisational authority",
      "Cross-check important factual claims",
      "Confirm quotations",
      "Preserve source records where appropriate",
      "Use primary sources where reasonably available",
      "Identify uncertainty",
      "Avoid presenting rumours as facts",
      "Disclose when information cannot be independently verified",
      "Distinguish estimates from confirmed figures",
      "Link to approved public sources where appropriate",
      "Review time-sensitive information before publication",
      "Avoid anonymous sources unless justified by public interest and safety",
      "Require stronger review for health, legal, financial or safety content",
    ],
  },
  authorship: {
    eyebrow: "AUTHORSHIP AND ATTRIBUTION",
    title:
      "Readers should understand who created, approved and contributed to a publication.",
    mayInclude: [
      "Author or editorial team",
      "Institutional owner",
      "Contributor",
      "Translator",
      "Photographer or illustrator",
      "Source organisation",
      "Publication date when real content exists",
      "Update date",
      "Correction notice",
      "Review or approval information where policy permits",
    ],
    principles: [
      "An author does not automatically speak for the entire federation.",
      "Institutional announcements require authorised ownership.",
      "Contributors must not be presented as staff unless that status is approved.",
      "External opinions must be clearly labelled.",
      "Conceptual visuals must not be presented as documentary photography.",
      "Copyright and usage rights must be recorded.",
    ],
  },
  communityStories: {
    eyebrow: "COMMUNITY STORIES, CONSENT AND SAFEGUARDING",
    title: "Community storytelling must preserve dignity, context and control.",
    statement:
      "A compelling story is never more important than the safety and dignity of the people involved.",
    items: [
      "Informed consent",
      "Clear purpose",
      "Respectful representation",
      "No unnecessary personal information",
      "Safeguarding for minors",
      "Care with health, trauma, immigration, employment and financial hardship",
      "Right to clarify quotations before publication where appropriate",
      "Image and media permissions",
      "Withdrawal and correction pathways",
      "Avoiding exploitative or sensational framing",
      "Community context",
      "Translation accuracy",
      "No implied endorsement",
      "Protection from foreseeable harm",
    ],
  },
  corrections: {
    eyebrow: "CORRECTIONS, UPDATES AND PUBLIC RECORD",
    title:
      "Trust grows when corrections are visible and the public record remains clear.",
    statement:
      "Material editorial changes should not be hidden through silent replacement. These future principles are not a formally approved correction policy.",
    categories: [
      {
        title: "Minor correction",
        description:
          "Spelling, formatting or non-material clarification corrected without hiding material meaning.",
      },
      {
        title: "Material correction",
        description:
          "A factual error affecting understanding, with a visible correction note, timestamp and explanation where appropriate.",
      },
      {
        title: "Update",
        description:
          "New verified information added while preserving original context where possible and clearly distinguishing the update.",
      },
      {
        title: "Withdrawal",
        description:
          "Content removed from normal publication due to serious accuracy, safety, rights or policy concerns, with a public notice retained where appropriate.",
      },
      {
        title: "Archive",
        description:
          "Content preserved for historical reference and clearly labelled when no longer current.",
      },
      {
        title: "Retraction",
        description:
          "A serious publication failure requiring a transparent public record, not silent deletion to avoid scrutiny.",
      },
    ] as const satisfies readonly Statement[],
  },
  multilingualAccessibility: {
    eyebrow: "TAMIL, ENGLISH AND ACCESSIBLE PUBLISHING",
    title:
      "A global Tamil newsroom must serve language, context and accessibility together.",
    groups: [
      {
        title: "Tamil publishing",
        items: [
          "Accurate Tamil grammar and spelling",
          "Appropriate terminology",
          "Readable Tamil typography",
          "Preservation of names and cultural context",
          "Avoidance of literal translation that loses meaning",
        ],
      },
      {
        title: "English publishing",
        items: [
          "Clear international communication",
          "Consistent naming and terminology",
          "Context for readers unfamiliar with Tamil institutions or concepts",
        ],
      },
      {
        title: "Translated versions",
        items: [
          "Reviewed by qualified language contributors where possible",
          "Labelled clearly",
          "Not assumed to be identical when cultural adaptation is required",
          "Corrected consistently across languages",
        ],
      },
      {
        title: "Accessibility",
        items: [
          "Semantic headings",
          "Useful alt text",
          "Captions and transcripts",
          "Readable contrast",
          "Keyboard navigation",
          "Plain-language summaries where appropriate",
          "Accessible tables and documents",
          "Avoidance of text embedded only in images",
        ],
      },
    ] as const satisfies readonly {
      readonly title: string;
      readonly items: readonly string[];
    }[],
  },
  discovery: {
    eyebrow: "FUTURE DISCOVERY AND ARCHIVES",
    title:
      "A future newsroom should make information easy to discover and difficult to misrepresent.",
    status: "Planned editorial discovery and archive",
    discoveryFields: [
      "Publication type",
      "Initiative",
      "Chapter or organisation",
      "Topic",
      "Language",
      "Author or institutional owner",
      "Publication year",
      "Updated or corrected status",
      "Event relationship",
      "Related content",
      "Archive status",
    ],
    articleFields: [
      "Title",
      "Summary",
      "Publication type",
      "Author or owner",
      "Publication and update information",
      "Language version",
      "Source and correction information",
      "Related initiatives or events",
      "Accessible media",
      "Clear archived or withdrawn status",
    ],
  },
  distribution: {
    eyebrow: "FUTURE DISTRIBUTION AND NOTIFICATIONS",
    title:
      "Publishing is only useful when important information reaches the right audience responsibly.",
    channels: [
      "Public website",
      "Member notifications",
      "Chapter notifications",
      "Organisation updates",
      "Future email summaries",
      "Future mobile notifications",
      "Event-related communication",
      "Public feeds where approved",
    ],
    principles: [
      "Consent for optional communications",
      "Clear notification categories",
      "Frequency controls",
      "Unsubscribe controls",
      "No hidden marketing",
      "No selling member information",
      "Urgent communication used only when justified",
      "Corrected information redistributed when necessary",
      "Chapter and organisation boundaries respected",
    ],
  },
  statusModel: {
    eyebrow: "PROPOSED CONTENT STATUS MODEL",
    title: "Editorial status should be clear internally and publicly.",
    description:
      "Internal workflow states should not automatically be exposed publicly. Visitors should be able to distinguish current, updated, corrected, archived, withdrawn and retracted content when real material exists.",
    internalStatuses: [
      "Idea",
      "Assigned",
      "Researching",
      "Draft",
      "Fact-checking",
      "Privacy review",
      "Language review",
      "Editorial review",
      "Approval pending",
      "Approved",
      "Scheduled",
      "Rejected",
      "Withdrawn before publication",
    ],
    publicStatuses: [
      "Published",
      "Updated",
      "Corrected",
      "Archived",
      "Withdrawn",
      "Retracted",
    ],
  },
  readiness: {
    eyebrow: "PUBLISH ONLY WHEN READY",
    title:
      "The newsroom should open only when editorial responsibility is real.",
    statement:
      "Tamil Ulagam should not publish placeholder articles simply to fill an empty news page.",
    items: [
      "Approved editorial purpose",
      "Named editorial ownership",
      "Publication-type definitions",
      "Source-verification standards",
      "Author and contributor rules",
      "Consent and safeguarding procedures",
      "Privacy review process",
      "Copyright and media-rights process",
      "Tamil and English language review",
      "Accessibility standards",
      "Correction and withdrawal process",
      "Moderation and legal escalation",
      "Secure content administration",
      "Public status and archive model",
      "Controlled publishing pilot",
      "Review and expansion criteria",
    ],
    callToAction: {
      label: "View the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  },
  interest: {
    eyebrow: "BEGIN A CONVERSATION",
    title:
      "Interested in contributing knowledge or supporting responsible public communication?",
    description:
      "Future editorial collaboration should begin with a responsible conversation about public value, expertise, scope and safeguarding.",
    areas: [
      "Tamil language editing",
      "Translation",
      "Community storytelling",
      "Research and archives",
      "Cultural documentation",
      "Photography and media rights",
      "Accessibility",
      "Editorial governance",
      "Fact-checking",
      "Safeguarding",
      "Public communications",
      "Institutional announcements",
    ],
    notice:
      "Article submissions and contributor onboarding are not currently open.",
    primaryCallToAction: {
      label: "Contact Tamil Ulagam",
      href: "/contact",
      variant: "primary",
    },
    secondaryCallToAction: {
      label: "Explore Partnerships",
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
      title: "Are public Tamil Ulagam articles currently available?",
      description:
        "No approved public article collection is being presented on this page yet.",
    },
    {
      title: "Why are there no placeholder news stories?",
      description:
        "Fictional headlines, dates and authors would misrepresent the platform’s current status.",
    },
    {
      title: "Can I submit an article now?",
      description:
        "No. Article-submission and contributor-onboarding workflows are not currently open.",
    },
    {
      title: "Will Tamil Ulagam publish in Tamil and English?",
      description:
        "Bilingual publishing is part of the long-term editorial direction, subject to qualified review.",
    },
    {
      title: "Will community stories require consent?",
      description:
        "Yes. Future community storytelling must include appropriate consent, privacy and safeguarding review.",
    },
    {
      title: "Will all chapter updates be published?",
      description:
        "No. Future chapter information must be verified, approved and relevant to public audiences.",
    },
    {
      title: "How will corrections be handled?",
      description:
        "Material errors should be corrected transparently rather than silently replaced.",
    },
    {
      title: "Will articles show authors and sources?",
      description:
        "Future publications should provide appropriate authorship, ownership and source context.",
    },
    {
      title: "Will Tamil Ulagam publish opinion pieces?",
      description:
        "Editorial or opinion formats may be considered, but they must be clearly distinguished from official announcements and verified facts.",
    },
    {
      title: "Can organisations submit announcements?",
      description:
        "Future organisational publishing may be considered only for verified organisations and approved scope.",
    },
    {
      title: "Will there be email or mobile news alerts?",
      description:
        "Future notification systems are part of the long-term platform direction after member and editorial foundations are ready.",
    },
    {
      title: "How can I discuss editorial collaboration?",
      description: "Use the Contact or Partners page to begin a conversation.",
    },
  ] as const satisfies readonly FaqItem[],
  finalCallToAction: {
    eyebrow: "BUILDING A TRUSTED PUBLIC RECORD",
    title:
      "Meaningful public communication begins with accuracy, ownership and respect.",
    description:
      "Tamil Ulagam welcomes thoughtful conversations with editors, researchers, cultural institutions, community organisations and responsible contributors interested in future public communication.",
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
      label: "Explore Partnerships",
      href: "/partners",
      variant: "text",
    },
  },
} as const satisfies {
  readonly hero: HeroContent;
  readonly definition: TextSection & {
    readonly capabilities: readonly string[];
    readonly statement: string;
    readonly principles: readonly Statement[];
  };
  readonly publicationTypes: TextSection & {
    readonly items: readonly Statement[];
  };
  readonly distinctions: TextSection & { readonly items: readonly Statement[] };
  readonly principles: TextSection & {
    readonly statement: string;
    readonly items: readonly string[];
  };
  readonly workflow: TextSection & {
    readonly label: string;
    readonly steps: readonly NumberedStatement[];
  };
  readonly verification: TextSection & {
    readonly label: string;
    readonly items: readonly string[];
  };
  readonly authorship: TextSection & {
    readonly mayInclude: readonly string[];
    readonly principles: readonly string[];
  };
  readonly communityStories: TextSection & {
    readonly statement: string;
    readonly items: readonly string[];
  };
  readonly corrections: TextSection & {
    readonly statement: string;
    readonly categories: readonly Statement[];
  };
  readonly multilingualAccessibility: TextSection & {
    readonly groups: readonly {
      readonly title: string;
      readonly items: readonly string[];
    }[];
  };
  readonly discovery: TextSection & {
    readonly status: string;
    readonly discoveryFields: readonly string[];
    readonly articleFields: readonly string[];
  };
  readonly distribution: TextSection & {
    readonly channels: readonly string[];
    readonly principles: readonly string[];
  };
  readonly statusModel: TextSection & {
    readonly internalStatuses: readonly string[];
    readonly publicStatuses: readonly string[];
  };
  readonly readiness: TextSection & {
    readonly statement: string;
    readonly items: readonly string[];
    readonly callToAction: CallToAction;
  };
  readonly interest: TextSection & {
    readonly areas: readonly string[];
    readonly notice: string;
    readonly primaryCallToAction: CallToAction;
    readonly secondaryCallToAction: CallToAction;
    readonly textCallToAction: CallToAction;
  };
  readonly faqs: readonly FaqItem[];
  readonly finalCallToAction: TextSection & {
    readonly primaryCallToAction: CallToAction;
    readonly secondaryCallToAction: CallToAction;
    readonly textCallToAction: CallToAction;
  };
};
