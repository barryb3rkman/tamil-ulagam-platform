import type { CallToAction } from "@tamil-ulagam/shared";

interface ContactHeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly note: string;
  readonly primaryCallToAction: CallToAction;
  readonly secondaryCallToAction: CallToAction;
}

interface TextSection {
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: string;
}

interface Statement {
  readonly title: string;
  readonly description: string;
}

interface LinkedStatement extends Statement {
  readonly href: `/${string}`;
  readonly linkLabel: string;
}

interface NumberedStatement extends Statement {
  readonly number: string;
}

interface FaqItem {
  readonly title: string;
  readonly description: string;
}

export const contactContent = {
  hero: {
    eyebrow: "CONTACT TAMIL ULAGAM",
    title: "Start with a clear purpose. Build the right conversation.",
    description:
      "Tamil Ulagam welcomes thoughtful enquiries from individuals, organisations, institutions and professionals interested in community, culture, knowledge and responsible collaboration.",
    note: "Contacting Tamil Ulagam does not create an application, membership, chapter or approved partnership.",
    primaryCallToAction: {
      label: "Choose an Enquiry Path",
      href: "/contact#contact-paths",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Explore Partnerships",
      href: "/partners",
      variant: "text",
    },
  } satisfies ContactHeroContent,
  purpose: {
    eyebrow: "HOW TO BEGIN A CONVERSATION",
    title: "The right context helps an enquiry reach the right discussion.",
    description:
      "An enquiry should be concise enough to understand, complete enough to route responsibly and proportionate to the conversation being requested.",
    guidance: [
      "Who you are",
      "Whether you represent yourself or an organisation",
      "The subject of the enquiry",
      "The intended outcome",
    ],
    statement:
      "This page provides enquiry context and does not collect personal information.",
  },
  categories: {
    eyebrow: "ENQUIRY CATEGORIES",
    title: "Different questions require different context.",
    items: [
      {
        title: "General enquiry",
        description:
          "Questions about Tamil Ulagam’s public vision, website or connected platform.",
        href: "/about",
        linkLabel: "Explore Tamil Ulagam",
      },
      {
        title: "Partnership discussion",
        description: "Institutional or professional collaboration.",
        href: "/partners",
        linkLabel: "Understand partnerships",
      },
      {
        title: "Chapter interest",
        description: "Interest in responsible local chapter discussions.",
        href: "/chapters",
        linkLabel: "Explore the chapter model",
      },
      {
        title: "Initiative collaboration",
        description:
          "Healthcare, education, business, jobs, research, tourism, culture or global events.",
        href: "/initiatives",
        linkLabel: "Explore initiatives",
      },
      {
        title: "Events or editorial discussion",
        description:
          "Events, community news, research or cultural-story collaboration.",
        href: "/events",
        linkLabel: "Explore the events vision",
      },
      {
        title: "Privacy, accessibility or website feedback",
        description:
          "Concerns about public content, data boundaries, accessibility or the website.",
        href: "/privacy",
        linkLabel: "Review the privacy foundation",
      },
    ] as const satisfies readonly LinkedStatement[],
  },
  informationToInclude: {
    eyebrow: "WHAT TO INCLUDE",
    title: "Useful enquiries are clear, specific and proportionate.",
    description:
      "These are future guidance points, not required fields or a live submission checklist.",
    items: [
      "Name",
      "Organisation, where relevant",
      "Authorised role",
      "Country or region",
      "Enquiry category",
      "Concise subject",
      "Relevant background",
      "Intended outcome",
      "Public reference links where appropriate",
      "Relevant Tamil Ulagam page or initiative",
      "Whether follow-up is time-sensitive",
      "Accessibility or language needs",
    ],
  },
  routing: {
    eyebrow: "HOW ENQUIRIES MAY BE ROUTED",
    title: "Contact should be routed by purpose, responsibility and access.",
    areas: [
      "Public information",
      "Partnerships",
      "Chapters",
      "Initiatives",
      "Events",
      "Editorial",
      "Privacy and security",
      "Accessibility",
      "Legal or governance",
      "Technical website issues",
    ],
    principles: [
      "Minimum necessary information",
      "Responsible ownership",
      "No unrestricted forwarding",
      "Role-appropriate access",
      "Recorded handover where needed",
      "Clear escalation",
      "No automatic approval",
      "No silent change of purpose",
      "Closure when no further action is required",
    ],
  },
  privacy: {
    eyebrow: "PRIVACY AND SENSITIVE INFORMATION",
    title: "Contact should not create unnecessary exposure.",
    description:
      "Future contact forms must have an approved privacy notice before personal information processing begins.",
    principles: [
      "Data minimisation",
      "Purpose limitation",
      "Restricted access",
      "Secure handling",
      "No public disclosure",
      "Retention limits",
      "Consent where required",
      "Safe escalation",
      "No selling of enquiry information",
      "No reuse for unrelated marketing",
      "Care with minors and vulnerable people",
      "Auditability for sensitive actions",
    ],
  },
  responseExpectations: {
    eyebrow: "RESPONSE EXPECTATIONS",
    title: "A responsible response depends on scope, ownership and readiness.",
    items: [
      "Contacting Tamil Ulagam does not guarantee a response",
      "Response time cannot currently be promised",
      "Some enquiries may require clarification",
      "Some requests may be outside scope",
      "Partnership discussions require review",
      "Membership, organisation and Tamil Sangam registration is open through Join, not through enquiry",
      "Chapter applications are not currently open",
      "Event and article submissions are not currently open",
      "Urgent deadlines should not be assumed accepted",
      "Public information may already exist on the website",
      "Approved future channels must provide acknowledgement and status expectations",
    ],
    statement:
      "Response depends on scope and availability. No service level or guaranteed response time is currently offered.",
  },
  institutionalEnquiries: {
    eyebrow: "ORGANISATIONS AND AUTHORISED REPRESENTATIVES",
    title:
      "Institutional enquiries should identify authority and purpose clearly.",
    details: [
      "Legal or public organisation name",
      "Organisation type",
      "Official website where available",
      "Authorised representative",
      "Role or title",
      "Purpose of contact",
      "Relevant country or jurisdiction",
      "Intended collaboration area",
      "Whether the enquiry is public or confidential",
      "Conflicts or commercial interests where relevant",
    ],
    boundaries: [
      "Discussion does not establish partnership.",
      "Use of the Tamil Ulagam name or logo is not permitted without approval.",
      "No one may claim to represent Tamil Ulagam without written authorisation.",
      "Private member information will not be shared simply because an organisation makes contact.",
    ],
    callToAction: {
      label: "Explore Partnerships",
      href: "/partners",
      variant: "text",
    },
  },
  workflow: {
    eyebrow: "CONTACT WORKFLOW",
    title: "A responsible contact system makes ownership and status clear.",
    description:
      "These stages connect enquiry context, responsible routing, review and closure.",
    label: "Contact workflow",
    steps: [
      {
        number: "01",
        title: "Enquiry submitted",
        description: "An approved channel accepts an enquiry.",
      },
      {
        number: "02",
        title: "Receipt after processing exists",
        description:
          "A receipt may be provided only after secure processing is available.",
      },
      {
        number: "03",
        title: "Basic routing review",
        description:
          "Purpose, scope and minimum required information are reviewed.",
      },
      {
        number: "04",
        title: "Assigned to responsible owner",
        description: "A suitable owner receives only the information required.",
      },
      {
        number: "05",
        title: "Clarification requested",
        description: "Further context may be requested where necessary.",
      },
      {
        number: "06",
        title: "Under consideration",
        description:
          "The responsible owner reviews the enquiry within available scope.",
      },
      {
        number: "07",
        title: "Referred to relevant area",
        description: "A controlled handover may occur when justified.",
      },
      {
        number: "08",
        title: "Response provided",
        description: "An appropriate response may be issued where possible.",
      },
      {
        number: "09",
        title: "No action or outside scope",
        description:
          "The enquiry may be closed when no responsible action is available.",
      },
      {
        number: "10",
        title: "Closed",
        description:
          "The record is concluded with an appropriate outcome status.",
      },
      {
        number: "11",
        title: "Reopened when justified",
        description:
          "A closed enquiry may be reconsidered when relevant new context exists.",
      },
    ] as const satisfies readonly NumberedStatement[],
  },
  faqs: [
    {
      title: "What context helps a Tamil Ulagam enquiry?",
      description:
        "Identify who you are, the subject, relevant organisation context and the outcome you want to discuss.",
    },
    {
      title: "Which enquiry categories does Tamil Ulagam cover?",
      description:
        "General, partnership, chapter, initiative, events, editorial, privacy, accessibility and website discussions are represented here.",
    },
    {
      title: "Can I send identity documents?",
      description:
        "No. Do not send sensitive identity documents through public contact routes.",
    },
    {
      title: "Can Tamil Ulagam help during an emergency?",
      description:
        "No. Contact the appropriate local emergency or public authority.",
    },
    {
      title: "Where can I learn more first?",
      description:
        "Review the About, Roadmap, Partners, Chapters, Tamil ID, Events and News pages.",
    },
  ] as const satisfies readonly FaqItem[],
  finalCallToAction: {
    eyebrow: "BEGIN WITH CLARITY",
    title:
      "Good conversations begin with the right purpose and responsible expectations.",
    description:
      "Explore Tamil Ulagam’s public pages to understand the platform and begin the right conversation.",
    primaryCallToAction: {
      label: "Explore Tamil Ulagam",
      href: "/about",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Explore Partnerships",
      href: "/partners",
      variant: "text",
    },
    textCallToActions: [
      { label: "Join Tamil Ulagam", href: "/join", variant: "text" },
      { label: "Explore Initiatives", href: "/initiatives", variant: "text" },
    ] as const satisfies readonly CallToAction[],
  },
} as const satisfies {
  readonly hero: ContactHeroContent;
  readonly purpose: TextSection & {
    readonly guidance: readonly string[];
    readonly statement: string;
  };
  readonly categories: TextSection & {
    readonly items: readonly LinkedStatement[];
  };
  readonly informationToInclude: TextSection & {
    readonly items: readonly string[];
  };
  readonly routing: TextSection & {
    readonly areas: readonly string[];
    readonly principles: readonly string[];
  };
  readonly privacy: TextSection & { readonly principles: readonly string[] };
  readonly responseExpectations: TextSection & {
    readonly items: readonly string[];
    readonly statement: string;
  };
  readonly institutionalEnquiries: TextSection & {
    readonly details: readonly string[];
    readonly boundaries: readonly string[];
    readonly callToAction: CallToAction;
  };
  readonly workflow: TextSection & {
    readonly label: string;
    readonly steps: readonly NumberedStatement[];
  };
  readonly faqs: readonly FaqItem[];
  readonly finalCallToAction: TextSection & {
    readonly primaryCallToAction: CallToAction;
    readonly secondaryCallToAction: CallToAction;
    readonly textCallToActions: readonly CallToAction[];
  };
};
