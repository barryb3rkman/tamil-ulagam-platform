export interface PublicPageContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly notice?: string;
}

export const publicPages = {
  about: {
    eyebrow: "Our foundation",
    title: "A global platform built for long-term Tamil connection",
    description:
      "Tamil Ulagam is developing a durable digital foundation for communities, institutions, knowledge, and opportunity across countries.",
  },
  "tamil-id": {
    eyebrow: "Future identity",
    title: "Tamil ID is a planned platform capability",
    description:
      "The identity and membership model will be designed in a later phase with privacy, security, governance, and inclusion at its core.",
    notice:
      "Tamil ID registration is not currently available. No applications or payments are being accepted.",
  },
  chapters: {
    eyebrow: "Global network",
    title: "Chapter infrastructure is being planned",
    description:
      "Future chapter capabilities will be shaped around transparent governance, local context, and responsible global coordination.",
    notice:
      "Chapter applications, directories, and administration tools are not currently available.",
  },
  events: {
    eyebrow: "Gathering communities",
    title: "A trusted events foundation is planned",
    description:
      "Future releases may support verified discovery and coordination for appropriate Tamil community events.",
    notice:
      "Event listings, submissions, registrations, and ticketing are not currently available.",
  },
  news: {
    eyebrow: "Federation updates",
    title: "A verified news and updates space is in preparation",
    description:
      "Official updates will appear here when an editorial and publishing process has been established.",
    notice: "No news articles have been published yet.",
  },
  partners: {
    eyebrow: "Responsible collaboration",
    title: "Partnership principles are being established",
    description:
      "Future collaborations will be represented only after they are formally confirmed and appropriate to the federation's purpose.",
    notice:
      "No partnership is implied by this website, and no partner directory is currently published.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Official contact channels are being prepared",
    description:
      "Verified contact details and an accessible enquiry process will be published once operational ownership is confirmed.",
    notice:
      "This foundation does not yet collect contact enquiries or personal information.",
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy information for the foundation website",
    description:
      "The present website foundation does not provide accounts, forms, payments, or member services. A complete privacy notice will be published before personal data collection begins.",
    notice:
      "This temporary notice is not a substitute for the reviewed policy required before public launch.",
  },
  terms: {
    eyebrow: "Terms",
    title: "Terms for the foundation website",
    description:
      "Formal website terms will be reviewed and published before public launch and before any interactive service becomes available.",
    notice:
      "This temporary content shell does not create service availability or an application process.",
  },
} as const satisfies Record<string, PublicPageContent>;
