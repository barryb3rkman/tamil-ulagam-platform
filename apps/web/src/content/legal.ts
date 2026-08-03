export type LegalDocumentKey = "privacy" | "terms";

export type LegalDocumentStatus = "Draft for Legal Review";

export interface LegalDocumentLink {
  readonly label: string;
  readonly href: `/${string}`;
}

export interface LegalStatusContent {
  readonly label: LegalDocumentStatus;
  readonly effectiveDate: "Not yet approved";
  readonly lastReviewed: "Not yet approved";
  readonly organisationDetails: "Pending confirmation";
  readonly contactDetails: "Pending confirmation";
}

export interface LegalReviewWarning {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
}

export interface LegalDecisionRequired {
  readonly label: "Decision required";
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
}

export interface LegalOperationalTrigger {
  readonly label: "Operational trigger";
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
}

export interface LegalReviewChecklist {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
}

export interface LegalSectionContent<TId extends string> {
  readonly id: TId;
  readonly number: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly itemIntroduction?: string;
  readonly items?: readonly string[];
  readonly links?: readonly LegalDocumentLink[];
  readonly decisionRequired?: LegalDecisionRequired;
  readonly operationalTrigger?: LegalOperationalTrigger;
}

export type PrivacySectionId =
  | "document-status"
  | "responsible-organisation"
  | "current-public-website"
  | "future-information"
  | "future-purposes"
  | "legal-bases"
  | "children"
  | "sharing-processors"
  | "international-transfers"
  | "retention"
  | "security"
  | "individual-rights"
  | "cookies"
  | "automated-decisions"
  | "contact-complaints"
  | "policy-changes"
  | "privacy-launch-decisions";

export type TermsSectionId =
  | "document-status"
  | "website-purpose"
  | "acceptable-use"
  | "planned-services"
  | "tamil-id-status"
  | "professional-services"
  | "intellectual-property"
  | "external-links"
  | "accuracy-availability"
  | "partnerships-affiliation"
  | "chapters-organisations"
  | "events-editorial"
  | "accounts-membership"
  | "privacy"
  | "suspension-enforcement"
  | "liability-disclaimers"
  | "governing-law-disputes"
  | "terms-changes"
  | "terms-launch-decisions";

export type PrivacySection = LegalSectionContent<PrivacySectionId>;
export type TermsSection = LegalSectionContent<TermsSectionId>;

export interface LegalPolicyDocument<TId extends string> {
  readonly key: LegalDocumentKey;
  readonly metadataTitle: string;
  readonly metadataDescription: string;
  readonly breadcrumb: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly openingStatement: string;
  readonly status: LegalStatusContent;
  readonly warning: LegalReviewWarning;
  readonly sections: readonly LegalSectionContent<TId>[];
  readonly reviewChecklist: LegalReviewChecklist;
  readonly relatedDocuments: readonly LegalDocumentLink[];
  readonly finalNotice: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly items: readonly string[];
  };
}

const draftStatus = {
  label: "Draft for Legal Review",
  effectiveDate: "Not yet approved",
  lastReviewed: "Not yet approved",
  organisationDetails: "Pending confirmation",
  contactDetails: "Pending confirmation",
} as const satisfies LegalStatusContent;

const sharedDraftWarning = {
  eyebrow: "IMPORTANT POLICY STATUS",
  title: "This document is a draft foundation, not an approved policy.",
  description:
    "It is provided for transparent public review of the intended direction and must not be treated as final legal advice, an enforceable agreement or evidence of regulatory approval.",
  items: [
    "Not yet the final governing policy",
    "Effective date not yet approved",
    "Organisation and contact details pending confirmation",
    "Data-processing practices must be updated before operational features launch",
  ],
} as const satisfies LegalReviewWarning;

export const privacyPolicy = {
  key: "privacy",
  metadataTitle: "Privacy Policy Draft | Tamil Ulagam",
  metadataDescription:
    "Review Tamil Ulagam’s draft privacy-policy foundation, current public-site limitations and the legal, governance and operational decisions required before personal-data processing begins.",
  breadcrumb: "Privacy Policy Draft",
  eyebrow: "PUBLIC POLICY FOUNDATION",
  title: "Privacy Policy",
  openingStatement:
    "This page describes Tamil Ulagam’s intended privacy approach. It is not yet the final governing privacy notice and must be updated to reflect approved organisation details, operational systems and applicable legal obligations before personal-data processing begins.",
  status: draftStatus,
  warning: sharedDraftWarning,
  sections: [
    {
      id: "document-status",
      number: "01",
      title: "Document status",
      paragraphs: [
        "This document is a draft policy foundation prepared to make unresolved privacy questions visible. It has no approved effective date and remains subject to formal legal, governance, security and operational review.",
        "It must be replaced or materially updated before Tamil Ulagam introduces forms, accounts, membership, Tamil ID, chapter applications, event registration, payments or any other feature that processes personal information.",
      ],
      operationalTrigger: {
        label: "Operational trigger",
        title: "Review before processing begins",
        description:
          "An approved privacy notice must match the systems and responsibilities that actually exist at launch.",
        items: [
          "Confirm the operating organisation and accountable owners",
          "Inventory each processing activity and information flow",
          "Approve notices, controls, security measures and user routes",
        ],
      },
    },
    {
      id: "responsible-organisation",
      number: "02",
      title: "Who is responsible",
      paragraphs: [
        "The final legal entity, data controller or other responsible organisation has not yet been confirmed. Its legal name, registered address, role in each processing activity and approved privacy contact must be established before this document becomes a governing notice.",
        "Tamil Ulagam is the public project name used by this website. It should not be interpreted as confirmation of a final incorporated entity or controller identity.",
      ],
      decisionRequired: {
        label: "Decision required",
        title: "Confirm accountable identity",
        description:
          "Formal governance must establish who determines purposes and means of processing and who answers privacy enquiries.",
        items: [
          "Final legal entity or responsible organisation",
          "Controller or responsible-party role by activity",
          "Registered address and approved privacy contact",
        ],
      },
    },
    {
      id: "current-public-website",
      number: "03",
      title: "Current public website",
      paragraphs: [
        "The current website consists of public informational pages describing Tamil Ulagam’s mission, planned platform and draft operating foundations. It does not currently provide interactive service workflows.",
        "The hosting and operational configuration must be reviewed before launch to confirm what technical information may be processed. This draft does not make an unverified claim that technical logs or similar operational records are absent.",
      ],
      itemIntroduction: "The current public release provides:",
      items: [
        "No membership account creation",
        "No working contact form",
        "No chapter application",
        "No event registration",
        "No article submission",
        "No payment processing",
        "No Tamil ID issuance",
      ],
    },
    {
      id: "future-information",
      number: "04",
      title: "Information that may be processed in future",
      paragraphs: [
        "Future approved services may require carefully defined information categories. The following possibilities are planning inputs only and are not a statement that the information is collected today.",
      ],
      itemIntroduction:
        "Potential future categories, each subject to necessity, approval and implementation:",
      items: [
        "Account information",
        "Membership information",
        "Profile information",
        "Identity-verification information",
        "Organisation and chapter information",
        "Event registrations",
        "Enquiry information",
        "Accessibility preferences",
        "Consent records",
        "Payment information through approved providers",
        "Device, security and audit information",
        "Editorial contribution information",
        "Support and complaint records",
      ],
    },
    {
      id: "future-purposes",
      number: "05",
      title: "Potential future purposes",
      paragraphs: [
        "Every purpose must be defined, documented and approved before the related processing begins. Collection should remain limited to information that is necessary for the approved purpose.",
      ],
      itemIntroduction:
        "Possible future purposes, subject to final approval and operational implementation:",
      items: [
        "Operating accounts",
        "Processing membership",
        "Issuing Tamil ID",
        "Managing chapters and organisations",
        "Supporting event participation",
        "Handling enquiries",
        "Maintaining platform security",
        "Preventing fraud and misuse",
        "Supporting accessibility",
        "Meeting applicable legal obligations",
        "Publishing approved public communications",
        "Providing support",
        "Improving approved services",
      ],
    },
    {
      id: "legal-bases",
      number: "06",
      title: "Legal bases",
      paragraphs: [
        "No final legal basis is assigned by this draft. The lawful grounds available will depend on the responsible organisation, jurisdiction, service design, information category and relationship with the individual.",
      ],
      itemIntroduction:
        "Categories requiring legal determination for each relevant activity may include:",
      items: [
        "Consent",
        "Contractual necessity",
        "Legal obligation",
        "Legitimate interests where applicable",
        "Other jurisdiction-specific grounds",
      ],
      decisionRequired: {
        label: "Decision required",
        title: "Map each purpose to an applicable ground",
        description:
          "Qualified review must establish and document an appropriate basis before any activity begins.",
        items: [
          "Identify applicable laws and jurisdiction",
          "Test necessity and proportionality",
          "Document consent or balancing requirements where relevant",
        ],
      },
    },
    {
      id: "children",
      number: "07",
      title: "Children and young people",
      paragraphs: [
        "Age eligibility has not been approved. No child-specific operational service is currently available through this public website.",
        "Any future service involving children or young people will require formal legal review, safeguarding design, age-appropriate information, consent or authorisation rules and proportionate access controls before children’s data is processed.",
      ],
    },
    {
      id: "sharing-processors",
      number: "08",
      title: "Sharing and processors",
      paragraphs: [
        "Future services may depend on hosting, communications, security, analytics, payment or operational providers. No provider or subprocessor list is approved in this draft, and no vendor relationship should be inferred from these categories.",
        "A reviewed provider inventory and, where appropriate, a public subprocessor register should identify roles, purposes, access boundaries, locations, safeguards and change procedures before operational processing begins.",
      ],
    },
    {
      id: "international-transfers",
      number: "09",
      title: "International transfers",
      paragraphs: [
        "Hosting regions, access locations and international transfer mechanisms have not been finalised. This draft does not claim that cross-border transfers currently occur or that they do not occur.",
        "The final system design must map relevant information flows and establish any notices, safeguards, contractual measures or assessments required by applicable law.",
      ],
      decisionRequired: {
        label: "Decision required",
        title: "Confirm locations and transfer safeguards",
        description:
          "Operational architecture and legal review must be aligned before international information flows are enabled.",
        items: [
          "Hosting and backup locations",
          "Provider and administrator access locations",
          "Applicable transfer rules and approved mechanisms",
        ],
      },
    },
    {
      id: "retention",
      number: "10",
      title: "Retention",
      paragraphs: [
        "No final retention period is approved. Retention schedules must be defined by information category, documented purpose, applicable legal requirement, security need and account or service lifecycle.",
        "The final approach should include deletion or anonymisation rules, preservation requirements, backup handling, review ownership and exceptions that are narrow and documented.",
      ],
    },
    {
      id: "security",
      number: "11",
      title: "Security",
      paragraphs: [
        "Tamil Ulagam intends to use proportionate organisational and technical safeguards. These principles are design expectations, not a guarantee that information can be made completely secure.",
      ],
      itemIntroduction: "Intended security principles include:",
      items: [
        "Least-privilege access",
        "Role-based access controls",
        "Encryption where appropriate",
        "Secure authentication",
        "Auditing and accountable changes",
        "Tested backup and recovery arrangements",
        "Incident response",
        "Provider review",
        "Data minimisation",
      ],
    },
    {
      id: "individual-rights",
      number: "12",
      title: "Individual rights",
      paragraphs: [
        "Individual rights depend on the applicable law and processing context. The final notice must explain which rights apply, how they may be exercised, how identity is verified proportionately and when lawful limitations may apply.",
      ],
      itemIntroduction: "Potential rights, where applicable, may include:",
      items: [
        "Access",
        "Correction",
        "Deletion",
        "Withdrawal of consent",
        "Objection",
        "Restriction",
        "Portability",
        "Complaint to an appropriate authority",
      ],
    },
    {
      id: "cookies",
      number: "13",
      title: "Cookies and similar technologies",
      paragraphs: [
        "The production cookie and analytics configuration is not yet approved. Strictly necessary technologies must be documented by purpose and duration before launch.",
        "Optional analytics, advertising or profiling must not be introduced without appropriate review and consent handling where required. A separate Cookie Notice may be needed before launch. This draft does not introduce or represent an active cookie-consent system.",
      ],
      operationalTrigger: {
        label: "Operational trigger",
        title: "Document technologies before deployment",
        description:
          "The production configuration must be inspected rather than inferred from this policy draft.",
        items: [
          "Inventory cookies, local storage and comparable technologies",
          "Classify necessity, purpose and duration",
          "Implement appropriate notice and choice controls where required",
        ],
      },
    },
    {
      id: "automated-decisions",
      number: "14",
      title: "Automated decisions and recommendations",
      paragraphs: [
        "No operational automated decision-making system is represented by the current public website.",
        "Any future matching, recommendation, ranking or eligibility system will require an approved purpose, meaningful transparency, quality and bias testing, human-review safeguards where appropriate and formal legal review before use.",
      ],
    },
    {
      id: "contact-complaints",
      number: "15",
      title: "Contact and complaints",
      paragraphs: [
        "An approved privacy contact, rights-request route and complaint process are pending. No Data Protection Officer, grievance officer or regulator contact is represented as appointed by this draft.",
        "The current Contact page explains future enquiry routes but does not provide or process submissions.",
      ],
      links: [
        { label: "Review the current Contact guidance", href: "/contact" },
      ],
    },
    {
      id: "policy-changes",
      number: "16",
      title: "Changes to the policy",
      paragraphs: [
        "A future approved policy should use clear version control and distinguish material changes from routine clarifications. Changes must be assessed against applicable notice and consent requirements.",
      ],
      itemIntroduction: "Future publication controls should include:",
      items: [
        "Approved effective date",
        "Revision date",
        "Material-change explanation",
        "Appropriate user notification",
        "Archived versions where necessary",
      ],
    },
    {
      id: "privacy-launch-decisions",
      number: "17",
      title: "Decisions required before launch",
      paragraphs: [
        "The checklist below records unresolved work. Completion must be evidenced through legal, governance, security and operational review before this draft is replaced by a governing privacy notice.",
      ],
    },
  ] as const satisfies readonly PrivacySection[],
  reviewChecklist: {
    eyebrow: "PRIVACY LAUNCH CHECKLIST",
    title: "Privacy decisions must be approved before processing begins.",
    description:
      "This checklist is an accountability record, not a statement that the work is complete.",
    items: [
      "Confirm legal entity",
      "Confirm jurisdiction and applicable laws",
      "Confirm controller or responsible-party identity",
      "Confirm privacy contact",
      "Inventory all processing",
      "Establish legal bases",
      "Approve retention schedule",
      "Confirm hosting locations",
      "Identify processors",
      "Define transfer mechanisms",
      "Approve children’s-data approach",
      "Approve rights-request process",
      "Approve complaint process",
      "Document cookies and analytics",
      "Conduct security and legal review",
    ],
  },
  relatedDocuments: [
    { label: "Read the draft Terms of Use", href: "/terms" },
    { label: "Review Contact guidance", href: "/contact" },
  ],
  finalNotice: {
    eyebrow: "FORMAL REVIEW REQUIRED",
    title: "This draft must be replaced by an approved operational notice.",
    description:
      "Before publication as a governing policy, qualified reviewers must confirm the responsible organisation, applicable law, actual systems, provider relationships, information flows and user procedures.",
    items: [
      "Legal approval has not been granted",
      "Operational facts remain subject to confirmation",
      "No effective date or final contact route is approved",
    ],
  },
} as const satisfies LegalPolicyDocument<PrivacySectionId>;

export const termsOfUse = {
  key: "terms",
  metadataTitle: "Terms of Use Draft | Tamil Ulagam",
  metadataDescription:
    "Review Tamil Ulagam’s draft public website terms and the legal, governance and operational decisions required before binding terms are published.",
  breadcrumb: "Terms of Use Draft",
  eyebrow: "PUBLIC POLICY FOUNDATION",
  title: "Terms of Use",
  openingStatement:
    "These draft terms describe the intended rules for Tamil Ulagam’s public website. They are not yet the final binding terms for membership, Tamil ID, chapters, events, partnerships or other future services.",
  status: draftStatus,
  warning: sharedDraftWarning,
  sections: [
    {
      id: "document-status",
      number: "01",
      title: "Document status",
      paragraphs: [
        "These terms are a draft foundation only. They have no approved effective date, the final website operator and legal entity are pending, governing law is unresolved and qualified legal review is required.",
        "They should not be treated as final binding terms or as terms for services that do not yet exist.",
      ],
    },
    {
      id: "website-purpose",
      number: "02",
      title: "Public website purpose",
      paragraphs: [
        "The current public website explains Tamil Ulagam’s direction and provides transparent foundations for future development. It does not create accounts, complete transactions or activate the planned services described across the site.",
      ],
      itemIntroduction: "The current website presents:",
      items: [
        "Mission and organisational direction",
        "Planned initiatives",
        "Concept pages",
        "Development roadmap",
        "Partnership and enquiry guidance",
        "Draft policy foundations",
      ],
    },
    {
      id: "acceptable-use",
      number: "03",
      title: "Acceptable use",
      paragraphs: [
        "The following are proposed expectations for responsible use of the public website. They remain subject to approval and must be aligned with applicable law and a proportionate enforcement process.",
      ],
      itemIntroduction: "Draft proposed rules include:",
      items: [
        "Use the website lawfully",
        "Do not interfere with security or availability",
        "Do not impersonate another person or organisation",
        "Do not perform unauthorised scraping",
        "Do not introduce malware or harmful code",
        "Do not engage in abusive or discriminatory conduct",
        "Do not falsely represent affiliation with Tamil Ulagam",
        "Do not misuse Tamil Ulagam branding",
        "Do not attempt to access restricted systems",
      ],
    },
    {
      id: "planned-services",
      number: "04",
      title: "Planned services are not currently available",
      paragraphs: [
        "Public descriptions of future capabilities do not mean that those services are operational, open for application or offered under these draft terms.",
      ],
      itemIntroduction: "The current website does not provide:",
      items: [
        "Membership",
        "Tamil ID issuance",
        "Chapter applications",
        "Event registration",
        "Event publishing",
        "Article submissions",
        "Job applications",
        "Medical services",
        "Education enrolment",
        "Business transactions",
        "Payments",
        "Mobile application access",
      ],
      operationalTrigger: {
        label: "Operational trigger",
        title: "Add service-specific terms before launch",
        description:
          "Each future service needs rules that match its real workflow, risks, governance and user relationship.",
        items: [
          "Complete product, legal and safeguarding review",
          "Publish clear eligibility and service conditions",
          "Align privacy notices, user controls and support routes",
        ],
      },
    },
    {
      id: "tamil-id-status",
      number: "05",
      title: "No government or official identity status",
      paragraphs: [
        "Tamil ID is a proposed community membership credential. It is not currently issued and must not be represented as official government identification or evidence of legal status.",
      ],
      itemIntroduction: "Tamil ID is not:",
      items: [
        "Government-issued identification",
        "Proof of nationality",
        "Proof of citizenship",
        "A passport",
        "A travel document",
        "A payment card",
      ],
      links: [{ label: "Review the Tamil ID concept", href: "/tamil-id" }],
    },
    {
      id: "professional-services",
      number: "06",
      title: "No medical, legal, financial or emergency service",
      paragraphs: [
        "The current public content is general information about a planned platform. It does not constitute medical, legal or financial advice and is not an emergency-response channel.",
        "People requiring urgent help should contact an appropriate local emergency, medical, legal, financial or public authority. Final service-specific limitations must remain accurate and proportionate rather than attempting to exclude responsibility indiscriminately.",
      ],
    },
    {
      id: "intellectual-property",
      number: "07",
      title: "Intellectual property",
      paragraphs: [
        "Final ownership, licensing and permitted-reuse rules require legal confirmation. This draft does not claim unverified registrations, trademark rights or ownership of third-party material.",
      ],
      itemIntroduction: "Intended principles include:",
      items: [
        "Tamil Ulagam branding must not be used to imply affiliation",
        "Third-party rights must be respected",
        "User-contributed content will require separate contribution terms",
        "Generated or conceptual images must not be treated as documentary proof",
      ],
      decisionRequired: {
        label: "Decision required",
        title: "Confirm ownership and permitted use",
        description:
          "A reviewed rights inventory and licensing approach must precede final terms.",
        items: [
          "Confirm ownership of names, branding, copy and media",
          "Document third-party licences and restrictions",
          "Approve contribution and reuse rules",
        ],
      },
    },
    {
      id: "external-links",
      number: "08",
      title: "External links",
      paragraphs: [
        "External links may be provided for context or convenience. Their inclusion does not automatically represent endorsement, control or continuing approval of an external service.",
        "Visitors should review external terms and privacy information. Links that are broken, misleading or unsafe may be corrected or removed through an approved maintenance process.",
      ],
    },
    {
      id: "accuracy-availability",
      number: "09",
      title: "Accuracy and availability",
      paragraphs: [
        "Public information is intended to be maintained responsibly. Planned features, sequencing and descriptions may change as governance, requirements and delivery evidence develop, and no fixed launch date is promised.",
        "Errors should be corrected transparently. Uninterrupted availability is not guaranteed, but this does not excuse deliberate misinformation, unlawful conduct or a failure to address known material errors responsibly.",
      ],
    },
    {
      id: "partnerships-affiliation",
      number: "10",
      title: "Partnerships and affiliation",
      paragraphs: [
        "A discussion, enquiry, image or public reference does not create an approved partnership. No organisation should publicly claim Tamil Ulagam affiliation without written approval from the future authorised operator.",
        "Organisations remain separate entities unless a formal agreement expressly establishes a different relationship. People shown in conceptual images are not evidence of endorsement or affiliation.",
      ],
      links: [
        { label: "Review the partnership foundation", href: "/partners" },
      ],
    },
    {
      id: "chapters-organisations",
      number: "11",
      title: "Chapters and organisations",
      paragraphs: [
        "No active chapter directory is currently presented. Chapter recognition will require future approved governance, verification, responsibilities and status controls.",
        "An independent organisation is not controlled by Tamil Ulagam merely because it appears in public discussion or contributes to a future conversation.",
      ],
      links: [{ label: "Review the chapter model", href: "/chapters" }],
    },
    {
      id: "events-editorial",
      number: "12",
      title: "Events and editorial content",
      paragraphs: [
        "The current website presents neither a live event calendar nor an approved collection of published articles. Event and editorial pages describe future models only.",
        "Future organisers, contributors and publishers will require separate eligibility, verification, rights, safety, correction and publication policies before submissions open.",
      ],
      links: [
        { label: "Review the events model", href: "/events" },
        { label: "Review the editorial model", href: "/news" },
      ],
    },
    {
      id: "accounts-membership",
      number: "13",
      title: "User accounts and membership",
      paragraphs: [
        "Account and membership terms must be drafted, reviewed and published before those systems launch. This document does not establish eligibility, pricing, renewal, suspension, cancellation or refund rules.",
      ],
    },
    {
      id: "privacy",
      number: "14",
      title: "Privacy",
      paragraphs: [
        "The Privacy Policy is also a draft foundation requiring formal legal and operational review. It does not yet identify a final responsible entity, approved contact route or complete production processing model.",
      ],
      links: [{ label: "Read the draft Privacy Policy", href: "/privacy" }],
    },
    {
      id: "suspension-enforcement",
      number: "15",
      title: "Suspension and enforcement",
      paragraphs: [
        "No active account-enforcement system is represented by this public website. Future enforcement rules require approval and must be linked to actual services and governance.",
      ],
      itemIntroduction: "Proposed future principles include:",
      items: [
        "Proportionate action",
        "Documented reasons",
        "Safety and legal considerations",
        "Review or appeal where appropriate",
      ],
    },
    {
      id: "liability-disclaimers",
      number: "16",
      title: "Liability and disclaimers",
      paragraphs: [
        "This draft deliberately does not include sweeping liability boilerplate. Final provisions must be specific to the operator, services, jurisdictions and mandatory rights that apply.",
      ],
      decisionRequired: {
        label: "Decision required",
        title: "Qualified legal drafting required",
        description:
          "The following subjects require jurisdiction-aware advice and formal approval before publication.",
        items: [
          "Warranties",
          "Liability limits",
          "Indemnities",
          "Jurisdiction-specific consumer rights",
          "Permitted exclusions",
          "Force majeure terms",
        ],
      },
    },
    {
      id: "governing-law-disputes",
      number: "17",
      title: "Governing law and disputes",
      paragraphs: [
        "Governing law, courts, arbitration, complaint handling and dispute-resolution procedures are not yet approved. No country, state, city, court or arbitral venue is selected by this draft.",
      ],
      decisionRequired: {
        label: "Decision required",
        title: "Confirm a fair and applicable dispute framework",
        description:
          "The final approach must account for the operator, service locations, user jurisdictions and mandatory consumer rights.",
        items: [
          "Applicable governing law",
          "Court, complaint or alternative-resolution routes",
          "Notice method and accessible user process",
        ],
      },
    },
    {
      id: "terms-changes",
      number: "18",
      title: "Changes to the terms",
      paragraphs: [
        "Future approved terms should use transparent version control. Material changes must be assessed for appropriate notice and, where required, renewed agreement.",
      ],
      itemIntroduction: "Future versioning should include:",
      items: [
        "Approved effective date",
        "Revision date",
        "Material-change summary",
        "Archived versions",
        "User notice where required",
      ],
    },
    {
      id: "terms-launch-decisions",
      number: "19",
      title: "Decisions required before launch",
      paragraphs: [
        "The checklist below identifies material decisions that remain open. It does not represent completed legal review or approval.",
      ],
    },
  ] as const satisfies readonly TermsSection[],
  reviewChecklist: {
    eyebrow: "TERMS LAUNCH CHECKLIST",
    title: "Binding terms require confirmed facts and formal approval.",
    description:
      "Each decision must be resolved against the actual operator, services and applicable law.",
    items: [
      "Confirm legal entity",
      "Confirm website operator",
      "Confirm governing law",
      "Confirm dispute process",
      "Confirm intellectual-property ownership",
      "Confirm acceptable-use enforcement",
      "Confirm external-content responsibilities",
      "Approve consumer-law treatment",
      "Approve liability language",
      "Approve membership-specific terms",
      "Approve event and contributor terms",
      "Approve payment and refund terms before payments",
      "Approve contact and notice method",
      "Complete formal legal review",
    ],
  },
  relatedDocuments: [
    { label: "Read the draft Privacy Policy", href: "/privacy" },
    { label: "Review Contact guidance", href: "/contact" },
  ],
  finalNotice: {
    eyebrow: "FORMAL REVIEW REQUIRED",
    title: "These draft terms are not ready to govern operational services.",
    description:
      "Qualified reviewers must confirm the website operator, applicable law, service-specific rules, mandatory rights, dispute process and notice method before binding terms are published.",
    items: [
      "No governing law or dispute venue is approved",
      "No final liability or consumer-law language is approved",
      "Future services require their own reviewed terms",
    ],
  },
} as const satisfies LegalPolicyDocument<TermsSectionId>;

export const legalDocuments = {
  privacy: privacyPolicy,
  terms: termsOfUse,
} as const satisfies Record<LegalDocumentKey, LegalPolicyDocument<string>>;
