import type { CallToAction } from "@tamil-ulagam/shared";

import type { ImageKey } from "@/config/images";

type TamilIdImageKey = Extract<ImageKey, "tamilIdShowcase">;

interface TamilIdHeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly caption: string;
  readonly imageKey: TamilIdImageKey;
  readonly primaryCallToAction: CallToAction;
  readonly secondaryCallToAction: CallToAction;
}

interface LabeledStatement {
  readonly title: string;
  readonly description: string;
}

interface JourneyStep extends LabeledStatement {
  readonly number: string;
}

interface CredentialArea {
  readonly label: string;
  readonly example: string;
}

interface VerificationContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly principles: readonly string[];
  readonly illustrativeUrl: string;
  readonly illustrativeUrlLabel: string;
  readonly publicInformation: readonly string[];
  readonly privateInformation: readonly string[];
}

type TamilIdFaq = LabeledStatement;

export const tamilIdContent = {
  hero: {
    eyebrow: "PLANNED DIGITAL MEMBERSHIP",
    title: "One membership. A world of connection.",
    description:
      "Tamil ID is envisioned as a secure digital membership credential connecting Tamil Ulagam members with chapters, organisations, events and future community services.",
    status: "In Development",
    caption: "Concept preview. Tamil ID is not yet available.",
    imageKey: "tamilIdShowcase",
    primaryCallToAction: {
      label: "Understand the Tamil ID",
      href: "/tamil-id#what-is-tamil-id",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "View the Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  } satisfies TamilIdHeroContent,
  definition: {
    eyebrow: "THE CONCEPT",
    title: "A membership credential for one connected Tamil platform.",
    description:
      "Tamil ID is planned as a trusted connection between a member and an approved Tamil Ulagam membership record. It is intended to make future participation clearer across web and mobile experiences while keeping private information protected.",
    principles: [
      "A Tamil Ulagam membership identifier",
      "A secure digital credential",
      "A connection to an approved membership record",
      "A future access point for chapters, events and organisations",
      "A privacy-conscious verification method",
      "One identity across web and future mobile systems",
    ],
  },
  notGovernmentId: {
    eyebrow: "CLEAR BOUNDARIES",
    title:
      "A community membership credential — not a government identity document.",
    description:
      "Tamil ID is not intended to establish citizenship, nationality or any official legal identity. It will never replace the documents issued by governments or financial institutions.",
    items: [
      "Proof of citizenship or nationality",
      "A passport, visa or travel document",
      "A government-issued identity card",
      "A replacement for official identification",
      "A financial or payment card",
      "A medical record",
      "A public database of private member information",
    ],
  },
  journey: {
    eyebrow: "PROPOSED MEMBERSHIP JOURNEY",
    title: "A carefully governed path from interest to membership.",
    description:
      "This proposed journey describes the accountability expected before Tamil ID is introduced. It is not an application process currently available through this website.",
    steps: [
      {
        number: "01",
        title: "Register interest",
        description: "A person expresses interest in joining Tamil Ulagam.",
      },
      {
        number: "02",
        title: "Create an account",
        description:
          "Secure account creation will be introduced in a future platform phase.",
      },
      {
        number: "03",
        title: "Complete a member profile",
        description:
          "Required information will depend on approved membership policy.",
      },
      {
        number: "04",
        title: "Submit a membership application",
        description:
          "Applicants may provide only the information required for the relevant membership type.",
      },
      {
        number: "05",
        title: "Administrative review",
        description:
          "Authorised administrators review the application using documented procedures.",
      },
      {
        number: "06",
        title: "Membership decision",
        description:
          "Applications may be approved, returned for clarification or declined.",
      },
      {
        number: "07",
        title: "Tamil ID issued",
        description: "Approved members receive a unique membership credential.",
      },
      {
        number: "08",
        title: "Ongoing status",
        description:
          "Membership status may later be renewed, suspended or closed through accountable processes.",
      },
    ] as const satisfies readonly JourneyStep[],
  },
  credential: {
    eyebrow: "CREDENTIAL CONCEPT",
    title: "Designed to communicate membership clearly and securely.",
    description:
      "The future credential should reveal only the information appropriate to its purpose, with sensitive records held separately behind authorised systems.",
    areas: [
      { label: "Tamil Ulagam identity", example: "Tamil Ulagam" },
      { label: "Member display name", example: "Member name" },
      { label: "Unique Tamil ID number", example: "TU-XX-000000" },
      { label: "Membership category or tier", example: "Membership category" },
      {
        label: "Country or chapter where appropriate",
        example: "Chapter or country",
      },
      { label: "Membership status", example: "Membership status" },
      {
        label: "Profile photograph where approved",
        example: "Policy-approved profile image",
      },
      {
        label: "Secure QR verification entry point",
        example: "Verification entry point",
      },
    ] as const satisfies readonly CredentialArea[],
  },
  verification: {
    eyebrow: "QR AND PUBLIC VERIFICATION",
    title: "Verification without exposing private information.",
    description:
      "The intended QR model is a secure path to an authorised verification experience, rather than a container for sensitive member data.",
    principles: [
      "A QR should contain or point to a secure verification URL.",
      "Sensitive personal data should not be stored directly in the QR.",
      "A verification page should return only approved public status information.",
      "Private records remain protected behind authorised systems.",
      "Revoked, suspended or expired credentials must be clearly represented.",
      "Verification activity may be logged for security and auditing.",
      "Expired or replaced QR tokens should not remain valid indefinitely.",
    ],
    illustrativeUrl: "tamilulagam.org/verify/TU-XX-000000",
    illustrativeUrlLabel: "Illustrative format only",
    publicInformation: [
      "Member display name",
      "Tamil ID number",
      "Current membership status",
      "Membership category",
      "Approved chapter or country",
      "Profile image only where consent and policy allow",
    ],
    privateInformation: [
      "Phone number",
      "Private email",
      "Date of birth",
      "Home address",
      "Identity-document details",
      "Payment information",
      "Private administrative notes",
      "Medical information",
    ],
  } satisfies VerificationContent,
  privacy: {
    eyebrow: "PRIVACY AND MEMBER CONTROL",
    title: "Membership should not require unnecessary exposure.",
    description:
      "A credible membership foundation must minimise collection, separate public and private data, and make responsibility visible throughout the member lifecycle.",
    principles: [
      {
        title: "Data minimisation",
        description:
          "Collect only information required for membership and platform operations.",
      },
      {
        title: "Public and private separation",
        description:
          "Public member information must be stored and exposed separately from private details.",
      },
      {
        title: "Member visibility choices",
        description:
          "Members should control optional public-profile visibility where policy permits.",
      },
      {
        title: "Purpose limitation",
        description:
          "Data collected for membership should not silently be reused for unrelated purposes.",
      },
      {
        title: "Consent records",
        description:
          "Important consent and privacy decisions should be recorded.",
      },
      {
        title: "Controlled access",
        description:
          "Administrative access must follow role and permission boundaries.",
      },
      {
        title: "Retention and deletion",
        description:
          "Membership records require approved retention and account-closure policies.",
      },
      {
        title: "Security and auditability",
        description:
          "Sensitive operations must be traceable without exposing secrets in logs.",
      },
    ] as const satisfies readonly LabeledStatement[],
  },
  access: {
    eyebrow: "FUTURE MEMBER ACCESS",
    title: "One credential, connecting future member experiences.",
    description:
      "Tamil ID may eventually support access to a connected set of Tamil Ulagam experiences as each service is introduced responsibly.",
    status: "Planned member experience",
    areas: [
      "Member profile",
      "Chapter affiliation",
      "Organisation participation",
      "Event registration",
      "Community announcements",
      "Future member benefits",
      "Education and opportunity discovery",
      "Future mobile access",
      "Partner services subject to approved agreements",
    ],
    note: "Possessing Tamil ID will not automatically guarantee access to every future service. Eligibility may depend on membership policy, location, partner rules and service availability.",
  },
  governance: {
    eyebrow: "TRUST, GOVERNANCE AND STATUS",
    title: "A credible identity system depends on accountable operations.",
    description:
      "Tamil ID can only become trustworthy when policy, administration, security and member support are designed to work together.",
    principles: [
      "Approved membership policy",
      "Clearly defined membership categories",
      "Documented approval and rejection procedures",
      "Role-based administration",
      "Status-change audit history",
      "Duplicate-account prevention",
      "Fraud and impersonation controls",
      "Dispute and appeal pathways",
      "Credential suspension and revocation",
      "Support and recovery procedures",
      "Chapter and organisation boundaries",
      "Incident response",
    ],
    statesLabel: "Proposed membership states",
    states: [
      "Interest registered",
      "Application in preparation",
      "Submitted",
      "Under review",
      "Clarification requested",
      "Approved",
      "Suspended",
      "Expired",
      "Closed",
    ],
  },
  rollout: {
    eyebrow: "STAGED ROLLOUT",
    title:
      "Build the policy first. Pilot the system carefully. Expand responsibly.",
    description:
      "Tamil ID should be introduced in deliberate stages, with each phase earning the next through governance, operational readiness and responsible review.",
    phases: [
      {
        number: "01",
        title: "Policy and governance",
        description:
          "Finalise membership categories, eligibility, privacy, public visibility and administrative responsibility.",
      },
      {
        number: "02",
        title: "Technical foundation",
        description:
          "Build authentication, profiles, role-based administration, auditing and secure member records.",
      },
      {
        number: "03",
        title: "Controlled membership pilot",
        description:
          "Test the complete workflow with limited members, chapters and administrators.",
      },
      {
        number: "04",
        title: "Tamil ID issuance",
        description:
          "Introduce digital credentials and public status verification after operational review.",
      },
      {
        number: "05",
        title: "Member-platform expansion",
        description:
          "Connect Tamil ID with events, organisations, chapters and future services.",
      },
      {
        number: "06",
        title: "Mobile access",
        description:
          "Introduce secure mobile credential access when the member foundation is stable.",
      },
    ] as const satisfies readonly JourneyStep[],
    callToAction: {
      label: "View the Full Roadmap",
      href: "/roadmap",
      variant: "text",
    },
  },
  faqs: [
    {
      title: "Is Tamil ID currently available?",
      description:
        "No. It is currently presented as a planned digital membership concept.",
    },
    {
      title: "Is Tamil ID a government-issued identity document?",
      description:
        "No. It is intended only as a Tamil Ulagam membership credential.",
    },
    {
      title: "Will sensitive personal information be stored in the QR code?",
      description:
        "The intended model is to avoid placing sensitive personal data directly in the QR code.",
    },
    {
      title: "What will a public verification page show?",
      description: "Only policy-approved membership information and status.",
    },
    {
      title: "Who can become a member?",
      description:
        "Eligibility and membership categories must be approved before applications open.",
    },
    {
      title: "Will membership be free or paid?",
      description:
        "Membership pricing and categories have not yet been finalised publicly.",
    },
    {
      title: "Will Tamil ID work in the future mobile application?",
      description:
        "Secure mobile access is part of the long-term platform vision.",
    },
    {
      title:
        "Can Tamil ID replace a passport, Aadhaar card or other official identification?",
      description: "No.",
    },
    {
      title: "What happens if a credential is suspended or expires?",
      description:
        "A future verification page should clearly show the current approved status.",
    },
    {
      title: "How can organisations help?",
      description:
        "Organisations may discuss membership, chapter or platform partnerships through the Partners page.",
    },
  ] as const satisfies readonly TamilIdFaq[],
  finalCallToAction: {
    eyebrow: "BUILDING THE MEMBERSHIP FOUNDATION",
    title:
      "A trusted Tamil ID begins with clear policy, secure systems and responsible participation.",
    description:
      "Tamil Ulagam welcomes thoughtful discussion with Tamil organisations, chapter leaders, privacy specialists, identity professionals and responsible institutional partners.",
    primaryCallToAction: {
      label: "Explore the Roadmap",
      href: "/roadmap",
      variant: "secondary",
    },
    secondaryCallToAction: {
      label: "Partner With Tamil Ulagam",
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
