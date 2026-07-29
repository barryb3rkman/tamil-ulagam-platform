import type { CallToAction } from "@tamil-ulagam/shared";

import { type ImageKey } from "@/config/images";

import {
  initiativeOverviewContent,
  type InitiativeEcosystemGroupId,
} from "./initiatives-overview";
import { type InitiativeSlug, initiatives } from "./initiatives";

export type InitiativeDetailLayout =
  "human-development" | "opportunity" | "knowledge-global";

export interface InitiativeDevelopmentStage {
  readonly title: string;
  readonly description: string;
}

export interface InitiativeRelatedEntry {
  readonly slug: InitiativeSlug;
  readonly relationship: string;
}

export interface InitiativeDetail {
  readonly slug: InitiativeSlug;
  readonly layout: InitiativeDetailLayout;
  readonly heroStatement: string;
  readonly introduction: string;
  readonly purpose: string;
  readonly conceptStatement: string;
  readonly intendedAudiences: readonly string[];
  readonly capabilities: readonly {
    readonly title: string;
    readonly description: string;
  }[];
  readonly principles: readonly string[];
  readonly readinessRequirements: readonly string[];
  readonly developmentPath: readonly InitiativeDevelopmentStage[];
  readonly participationStatement: string;
  readonly primaryCallToAction: CallToAction;
  readonly secondaryCallToAction: CallToAction;
  readonly related: readonly [
    InitiativeRelatedEntry,
    InitiativeRelatedEntry,
    InitiativeRelatedEntry,
  ];
}

const sharedDevelopmentPath = {
  foundation: {
    title: "Foundation",
    description:
      "Define the purpose, operating model, data boundaries, governance and accountable ownership.",
  },
  partnerReadiness: {
    title: "Partner readiness",
    description:
      "Establish verified institutions, organisations or professional participation before public access is considered.",
  },
  controlledPilot: {
    title: "Controlled pilot",
    description:
      "Test a limited experience with accountable administration, clear feedback and careful safeguards.",
  },
  responsibleExpansion: {
    title: "Responsible expansion",
    description:
      "Expand only where adoption, trust, quality and measurable community need support the next stage.",
  },
} as const satisfies Record<string, InitiativeDevelopmentStage>;

export const initiativeDetails = {
  healthcare: {
    slug: "healthcare",
    layout: "human-development",
    heroStatement:
      "Healthcare support that understands language, culture and community.",
    introduction:
      "Tamil Ulagam is exploring a future trusted discovery and support network shaped with qualified professionals, responsible institutions and community wellbeing partners.",
    purpose:
      "The proposed initiative would help Tamil communities discover relevant professionals, wellbeing resources and accountable partnerships without replacing clinical care or making medical promises.",
    conceptStatement:
      "Concept visual representing the planned healthcare initiative.",
    intendedAudiences: [
      "Individuals and families",
      "Tamil-speaking healthcare professionals",
      "Community health organisations",
      "Hospitals and clinics",
      "Wellbeing educators",
      "Diaspora support groups",
    ],
    capabilities: [
      {
        title: "Professional discovery",
        description:
          "A proposed way to discover verified healthcare professionals by location, speciality and language support.",
      },
      {
        title: "Tamil-language accessibility",
        description:
          "Future discovery features may help people identify care settings where Tamil communication can support understanding and trust.",
      },
      {
        title: "Health and wellbeing resources",
        description:
          "Educational resources could be curated through responsible editorial and professional review processes.",
      },
      {
        title: "Partner-supported programmes",
        description:
          "Community health initiatives may be introduced in future only with verified institutions and organisations.",
      },
      {
        title: "Cross-border guidance",
        description:
          "Discovery of information and providers would be designed carefully, without unsafe medical advice or guarantees.",
      },
    ],
    principles: [
      "No diagnosis or medical advice through the platform",
      "Clear emergency and country-specific disclaimers",
      "Language support treated as a discovery aid, not a clinical claim",
    ],
    readinessRequirements: [
      "Professional verification",
      "Country-specific rules",
      "Medical-content review",
      "Privacy-conscious data handling",
      "Accountable partner agreements",
    ],
    developmentPath: [
      sharedDevelopmentPath.foundation,
      sharedDevelopmentPath.partnerReadiness,
      sharedDevelopmentPath.controlledPilot,
      sharedDevelopmentPath.responsibleExpansion,
    ],
    participationStatement:
      "Healthcare professionals, institutions and wellbeing organisations may help define a safe, culturally aware future direction.",
    primaryCallToAction: {
      label: "Explore the Healthcare Vision",
      href: "#capabilities",
    },
    secondaryCallToAction: {
      label: "Discuss a Healthcare Partnership",
      href: "/partners",
      variant: "secondary",
    },
    related: [
      {
        slug: "education",
        relationship:
          "Health understanding benefits from accessible learning and trusted guidance.",
      },
      {
        slug: "research",
        relationship:
          "Responsible health resources require careful evidence and review.",
      },
      {
        slug: "global-events",
        relationship:
          "Future community programmes may bring wellbeing conversations together responsibly.",
      },
    ],
  },
  education: {
    slug: "education",
    layout: "human-development",
    heroStatement:
      "Learning that strengthens identity and expands opportunity.",
    introduction:
      "Tamil Ulagam is shaping a future education ecosystem around Tamil language, cultural knowledge, mentorship, learning resources and opportunity discovery.",
    purpose:
      "The initiative is intended to connect learners, families, educators and institutions through carefully developed pathways rather than claim that courses, scholarships or tutoring are currently available.",
    conceptStatement:
      "Concept visual representing the planned education initiative.",
    intendedAudiences: [
      "Students",
      "Parents",
      "Teachers",
      "Tamil schools",
      "Universities",
      "Researchers",
      "Mentors",
      "Educational organisations",
    ],
    capabilities: [
      {
        title: "Tamil language learning",
        description:
          "Future pathways for discovering language-learning resources and trusted educational partners.",
      },
      {
        title: "Cultural and historical education",
        description:
          "Proposed connections to contextual learning that carries Tamil knowledge between generations.",
      },
      {
        title: "Curated learning resources",
        description:
          "An intended editorial approach for useful resources reviewed for relevance and quality.",
      },
      {
        title: "Mentor and tutor discovery",
        description:
          "A future discovery layer for verified mentors and tutors, subject to safeguarding standards.",
      },
      {
        title: "Scholarship and opportunity discovery",
        description:
          "Transparent information pathways may be introduced where partners can be verified.",
      },
      {
        title: "Educational partnerships",
        description:
          "Institutions could help shape responsible programmes, content and access models.",
      },
      {
        title: "Youth and intergenerational programmes",
        description:
          "Future initiatives may connect learners with community knowledge in age-appropriate ways.",
      },
    ],
    principles: [
      "Learning should honour Tamil identity alongside wider opportunity",
      "Young people require clear safeguarding",
      "Information must be transparent about availability and eligibility",
    ],
    readinessRequirements: [
      "Educator and institution verification",
      "Age-appropriate content",
      "Safeguarding for minors",
      "Content quality review",
      "Transparent scholarship information",
      "Privacy-conscious student data",
      "Responsible communication",
    ],
    developmentPath: [
      sharedDevelopmentPath.foundation,
      sharedDevelopmentPath.partnerReadiness,
      sharedDevelopmentPath.controlledPilot,
      sharedDevelopmentPath.responsibleExpansion,
    ],
    participationStatement:
      "Educators, schools, universities and mentors may contribute expertise toward a considered future learning ecosystem.",
    primaryCallToAction: {
      label: "Explore the Education Vision",
      href: "#capabilities",
    },
    secondaryCallToAction: {
      label: "Partner in Education",
      href: "/partners",
      variant: "secondary",
    },
    related: [
      {
        slug: "research",
        relationship:
          "Research can strengthen the quality and context of future learning resources.",
      },
      {
        slug: "arts-culture",
        relationship:
          "Creative practice and heritage are essential pathways for cultural learning.",
      },
      {
        slug: "jobs",
        relationship:
          "Learning and mentorship can support future career readiness.",
      },
    ],
  },
  business: {
    slug: "business",
    layout: "opportunity",
    heroStatement: "Trusted connections for Tamil enterprise across borders.",
    introduction:
      "Tamil Ulagam is considering a future network for verified Tamil-owned businesses, founders, professionals, institutions and responsible partners.",
    purpose:
      "The proposed network would focus on trust, discovery and accountable collaboration rather than present active listings, investment offers or commercial services.",
    conceptStatement:
      "Concept visual representing the planned business networking initiative.",
    intendedAudiences: [
      "Founders",
      "Entrepreneurs",
      "Small and medium businesses",
      "Established companies",
      "Professional service providers",
      "Investors and mentors",
      "Chambers and associations",
    ],
    capabilities: [
      {
        title: "Verified business directory",
        description:
          "A future directory could make it easier to discover businesses after responsible verification.",
      },
      {
        title: "Founder and professional discovery",
        description:
          "Planned pathways for finding relevant people, expertise and collaboration opportunities.",
      },
      {
        title: "B2B enquiry pathways",
        description:
          "Future contact routes may be introduced with clear representation and auditability expectations.",
      },
      {
        title: "Mentorship and knowledge exchange",
        description:
          "A proposed setting for founders and professionals to share useful experience responsibly.",
      },
      {
        title: "International market discovery",
        description:
          "Future information pathways may help organisations understand cross-border opportunities.",
      },
      {
        title: "Partnership opportunities",
        description:
          "Verified institutions and associations could help shape trusted connections.",
      },
      {
        title: "Future member offers and services",
        description:
          "Any future service would be introduced only after governance and commercial safeguards are ready.",
      },
    ],
    principles: [
      "Trust must precede discovery",
      "Commercial participation needs clear disclosures",
      "No investment outcome can be promised",
    ],
    readinessRequirements: [
      "Organisation verification",
      "Authorised representatives",
      "Fraud controls",
      "Clear commercial disclosures",
      "Enquiry auditability",
      "Moderation",
      "Country-specific legal considerations",
      "No investment guarantees",
    ],
    developmentPath: [
      sharedDevelopmentPath.foundation,
      sharedDevelopmentPath.partnerReadiness,
      sharedDevelopmentPath.controlledPilot,
      sharedDevelopmentPath.responsibleExpansion,
    ],
    participationStatement:
      "Founders, business associations and professional organisations may help define trustworthy future participation standards.",
    primaryCallToAction: {
      label: "Explore the Business Vision",
      href: "#capabilities",
    },
    secondaryCallToAction: {
      label: "Discuss a Business Partnership",
      href: "/partners",
      variant: "secondary",
    },
    related: [
      {
        slug: "jobs",
        relationship:
          "Enterprise growth and career opportunity are closely connected.",
      },
      {
        slug: "tourism",
        relationship:
          "Future hospitality and heritage discovery can support responsible local enterprise.",
      },
      {
        slug: "global-events",
        relationship:
          "Gatherings may create future spaces for responsible professional connection.",
      },
    ],
  },
  jobs: {
    slug: "jobs",
    layout: "opportunity",
    heroStatement:
      "Connecting Tamil talent with meaningful global opportunity.",
    introduction:
      "Tamil Ulagam is exploring a future careers platform for verified employers, professionals, students and career-development partners.",
    purpose:
      "The initiative is intended to establish accountable pathways for talent and opportunity, not to present active job listings, applications or employer dashboards today.",
    conceptStatement:
      "Concept visual representing the planned jobs and careers initiative.",
    intendedAudiences: [
      "Job seekers",
      "Students",
      "Experienced professionals",
      "Employers",
      "Recruiters",
      "Mentors",
      "Training organisations",
    ],
    capabilities: [
      {
        title: "Professional profiles",
        description:
          "Future profile pathways could help people present relevant experience with clear privacy controls.",
      },
      {
        title: "Verified employer onboarding",
        description:
          "Employers would need accountable verification before any future opportunity publishing.",
      },
      {
        title: "Structured job listings",
        description:
          "A future listing model could prioritise clear salary, location and role information.",
      },
      {
        title: "Search and filtering",
        description:
          "Planned discovery tools may help people navigate relevant opportunities transparently.",
      },
      {
        title: "Application workflows",
        description:
          "Any future application process would require auditable, privacy-conscious handling.",
      },
      {
        title: "Career resources and mentorship",
        description:
          "Guidance pathways could connect professional development with trusted contributors.",
      },
      {
        title: "Future relevance-based recommendations",
        description:
          "Recommendations would be considered only with fair and transparent matching standards.",
      },
    ],
    principles: [
      "Opportunity must be clear, fair and verifiable",
      "Applicant privacy cannot be an afterthought",
      "Career pathways should not make promises about outcomes",
    ],
    readinessRequirements: [
      "Employer verification",
      "Listing moderation",
      "Anti-fraud controls",
      "Applicant privacy",
      "Clear salary and location information",
      "Application audit records",
      "Fair and transparent matching",
      "Country-specific employment considerations",
    ],
    developmentPath: [
      sharedDevelopmentPath.foundation,
      sharedDevelopmentPath.partnerReadiness,
      sharedDevelopmentPath.controlledPilot,
      sharedDevelopmentPath.responsibleExpansion,
    ],
    participationStatement:
      "Employers, recruiters, mentors and training organisations may help establish a transparent future careers model.",
    primaryCallToAction: {
      label: "Explore the Careers Vision",
      href: "#capabilities",
    },
    secondaryCallToAction: {
      label: "Discuss an Employer Partnership",
      href: "/partners",
      variant: "secondary",
    },
    related: [
      {
        slug: "education",
        relationship:
          "Learning and mentorship can help people prepare for future opportunity.",
      },
      {
        slug: "business",
        relationship:
          "Verified organisations are essential to meaningful career pathways.",
      },
      {
        slug: "research",
        relationship:
          "Evidence and transparent design can strengthen future career matching.",
      },
    ],
  },
  research: {
    slug: "research",
    layout: "knowledge-global",
    heroStatement: "Connecting Tamil knowledge, scholarship and discovery.",
    introduction:
      "Tamil Ulagam is considering a future research and knowledge ecosystem for preservation, collaboration, discovery and responsible innovation.",
    purpose:
      "The initiative would help scholars, institutions and communities connect around knowledge with transparent provenance, not claim that a live archive or grant programme already exists.",
    conceptStatement:
      "Concept visual representing the planned research and innovation initiative.",
    intendedAudiences: [
      "Scholars",
      "Universities",
      "Research institutions",
      "Students",
      "Archivists",
      "Technologists",
      "Cultural historians",
      "Independent researchers",
    ],
    capabilities: [
      {
        title: "Researcher and institution discovery",
        description:
          "A future way to find relevant people and institutions across Tamil research fields.",
      },
      {
        title: "Digital knowledge resources",
        description:
          "Proposed resource pathways with clear source context and editorial responsibility.",
      },
      {
        title: "Archive and preservation initiatives",
        description:
          "Future preservation work would require permissions, stewardship and sustainable standards.",
      },
      {
        title: "Collaboration opportunities",
        description:
          "Institutions and researchers may be able to identify responsible collaboration routes.",
      },
      {
        title: "Research events and publications",
        description:
          "Future discovery could connect scholarly activity without claiming active publishing services.",
      },
      {
        title: "Responsible datasets and documentation",
        description:
          "Any future data work would prioritise provenance, context and ethical use.",
      },
      {
        title: "Innovation networks",
        description:
          "A proposed network could connect knowledge with responsible future innovation.",
      },
    ],
    principles: [
      "Knowledge needs clear provenance",
      "Preservation must respect rights holders",
      "Innovation should be accountable to community context",
    ],
    readinessRequirements: [
      "Source attribution",
      "Copyright and licensing",
      "Academic review",
      "Archival permissions",
      "Institutional agreements",
      "Data quality",
      "Ethical research standards",
      "Transparent provenance",
    ],
    developmentPath: [
      sharedDevelopmentPath.foundation,
      sharedDevelopmentPath.partnerReadiness,
      sharedDevelopmentPath.controlledPilot,
      sharedDevelopmentPath.responsibleExpansion,
    ],
    participationStatement:
      "Scholars, archivists, institutions and technologists may contribute to responsible future knowledge foundations.",
    primaryCallToAction: {
      label: "Explore the Research Vision",
      href: "#capabilities",
    },
    secondaryCallToAction: {
      label: "Discuss an Academic Partnership",
      href: "/partners",
      variant: "secondary",
    },
    related: [
      {
        slug: "education",
        relationship:
          "Research can deepen future learning resources and educational context.",
      },
      {
        slug: "arts-culture",
        relationship:
          "Cultural preservation depends on respectful documentation and attribution.",
      },
      {
        slug: "global-events",
        relationship:
          "Future gatherings may help knowledge travel between institutions and communities.",
      },
    ],
  },
  tourism: {
    slug: "tourism",
    layout: "opportunity",
    heroStatement:
      "Helping the diaspora discover Tamil places, heritage and hospitality.",
    introduction:
      "Tamil Ulagam is exploring a future discovery platform connecting diaspora visitors with Tamil heritage, destinations, hospitality providers and authentic cultural experiences.",
    purpose:
      "The initiative is intended to support responsible discovery and cultural context, not to present bookings, prices, hotels or itineraries as currently available services.",
    conceptStatement:
      "Concept visual representing the planned tourism and hospitality initiative.",
    intendedAudiences: [
      "Diaspora travellers",
      "Families",
      "Heritage organisations",
      "Tourism providers",
      "Hospitality businesses",
      "Cultural guides",
      "Local chapters",
    ],
    capabilities: [
      {
        title: "Heritage destination discovery",
        description:
          "Future discovery could connect people with places of Tamil cultural and historical significance.",
      },
      {
        title: "Cultural journey guidance",
        description:
          "Proposed guidance may support more contextual, respectful travel planning.",
      },
      {
        title: "Verified hospitality providers",
        description:
          "Any future provider discovery would depend on verification and clear policies.",
      },
      {
        title: "Local chapter recommendations",
        description:
          "Future chapters may contribute local knowledge through accountable collaboration.",
      },
      {
        title: "Community-led experiences",
        description:
          "Community participation may help shape authentic experiences with appropriate safeguards.",
      },
      {
        title: "Travel resources",
        description:
          "Future resources could make practical and cultural information easier to discover.",
      },
      {
        title: "Future responsible booking integrations",
        description:
          "Any booking connection would be considered only after provider, pricing and support readiness.",
      },
    ],
    principles: [
      "Discovery should respect place and culture",
      "Travel information needs transparent context",
      "No provider or travel outcome can be guaranteed",
    ],
    readinessRequirements: [
      "Provider verification",
      "Clear pricing and policies",
      "Safety information",
      "Local regulation",
      "Responsible cultural representation",
      "Accessibility information",
      "Dispute and support processes",
      "No misleading travel guarantees",
    ],
    developmentPath: [
      sharedDevelopmentPath.foundation,
      sharedDevelopmentPath.partnerReadiness,
      sharedDevelopmentPath.controlledPilot,
      sharedDevelopmentPath.responsibleExpansion,
    ],
    participationStatement:
      "Heritage bodies, hospitality providers and local chapters may help shape a respectful future discovery model.",
    primaryCallToAction: {
      label: "Explore the Tourism Vision",
      href: "#capabilities",
    },
    secondaryCallToAction: {
      label: "Discuss a Tourism Partnership",
      href: "/partners",
      variant: "secondary",
    },
    related: [
      {
        slug: "business",
        relationship:
          "Hospitality and cultural discovery can support responsible local enterprise.",
      },
      {
        slug: "arts-culture",
        relationship:
          "Creative practice and heritage help visitors understand place beyond a destination list.",
      },
      {
        slug: "global-events",
        relationship:
          "Future gatherings may create meaningful reasons to explore Tamil places.",
      },
    ],
  },
  "arts-culture": {
    slug: "arts-culture",
    layout: "knowledge-global",
    heroStatement:
      "A global stage for Tamil creativity, heritage and expression.",
    introduction:
      "Tamil Ulagam is shaping a future cultural ecosystem for classical and contemporary artists, archives, institutions, discovery and recognition.",
    purpose:
      "The initiative is intended to support respectful visibility and preservation without claiming that awards, grants, bookings or a live archive are active today.",
    conceptStatement:
      "Concept visual representing the planned arts, music and culture initiative.",
    intendedAudiences: [
      "Musicians",
      "Dancers",
      "Visual artists",
      "Writers",
      "Filmmakers",
      "Cultural institutions",
      "Teachers",
      "Audiences",
      "Heritage organisations",
    ],
    capabilities: [
      {
        title: "Artist and organisation discovery",
        description:
          "A future discovery layer could help people find artists and cultural organisations with consent.",
      },
      {
        title: "Cultural resources and archives",
        description:
          "Proposed knowledge pathways would respect rights, context and archival permissions.",
      },
      {
        title: "Performance and programme discovery",
        description:
          "Future visibility may help communities find relevant activity without presenting active bookings.",
      },
      {
        title: "Educational connections",
        description:
          "Creative practice could connect with future learning and intergenerational knowledge.",
      },
      {
        title: "Global creative collaboration",
        description:
          "A proposed network may support responsible connection across borders and disciplines.",
      },
      {
        title: "Recognition and future awards",
        description:
          "Any future recognition programme would need transparent selection and governance.",
      },
      {
        title: "Digital cultural preservation",
        description:
          "Future preservation work would be introduced with attribution and permissions at its centre.",
      },
    ],
    principles: [
      "Creative work deserves context and consent",
      "Culture should not be reduced to decoration",
      "Recognition requires transparent processes",
    ],
    readinessRequirements: [
      "Artist and organisation consent",
      "Copyright and media rights",
      "Cultural context and accuracy",
      "Respectful representation",
      "Content moderation",
      "Archival permissions",
      "Transparent selection processes",
    ],
    developmentPath: [
      sharedDevelopmentPath.foundation,
      sharedDevelopmentPath.partnerReadiness,
      sharedDevelopmentPath.controlledPilot,
      sharedDevelopmentPath.responsibleExpansion,
    ],
    participationStatement:
      "Artists, teachers, heritage organisations and cultural institutions may help establish respectful future pathways.",
    primaryCallToAction: {
      label: "Explore the Culture Vision",
      href: "#capabilities",
    },
    secondaryCallToAction: {
      label: "Discuss a Cultural Partnership",
      href: "/partners",
      variant: "secondary",
    },
    related: [
      {
        slug: "education",
        relationship:
          "Cultural learning helps knowledge move between generations.",
      },
      {
        slug: "research",
        relationship:
          "Documentation and attribution can support responsible cultural preservation.",
      },
      {
        slug: "global-events",
        relationship:
          "Future gatherings may provide a thoughtful stage for Tamil creativity.",
      },
    ],
  },
  "global-events": {
    slug: "global-events",
    layout: "knowledge-global",
    heroStatement:
      "Bringing Tamil communities together across cities and continents.",
    introduction:
      "Tamil Ulagam is considering a future platform for federation programmes, chapter gatherings, cultural events, professional summits and educational participation.",
    purpose:
      "The initiative would establish responsible discovery and participation foundations before it ever presents live dates, registrations, ticketing or streaming as available.",
    conceptStatement:
      "Concept visual representing the planned global events initiative.",
    intendedAudiences: [
      "Members",
      "Chapters",
      "Tamil organisations",
      "Event organisers",
      "Speakers",
      "Artists",
      "Institutions",
      "Sponsors and partners",
    ],
    capabilities: [
      {
        title: "Global event discovery",
        description:
          "A future view could make relevant Tamil programmes easier to discover across regions.",
      },
      {
        title: "Country and chapter event listings",
        description:
          "Verified organisers may eventually contribute accountable local and global information.",
      },
      {
        title: "Future registration workflows",
        description:
          "Any future registration would require clear policies, privacy and operational readiness.",
      },
      {
        title: "Attendance and participation",
        description:
          "Planned pathways may help communities understand how to take part when services are introduced.",
      },
      {
        title: "Hybrid and online-event support",
        description:
          "Future formats could be considered with reliable access and moderation standards.",
      },
      {
        title: "Speaker and programme information",
        description:
          "Verified information may help people understand future programmes without inventing events.",
      },
      {
        title: "Future streaming and event archives",
        description:
          "Any future media offering would need permissions, support workflows and durable stewardship.",
      },
    ],
    principles: [
      "Gatherings need accountable organisers",
      "Participation must be clear and safe",
      "Global presence should remain locally grounded",
    ],
    readinessRequirements: [
      "Organiser verification",
      "Event moderation",
      "Clear cancellation policies",
      "Participant privacy",
      "Payment readiness when introduced",
      "Safety and venue information",
      "Content and media permissions",
      "Reliable support workflows",
    ],
    developmentPath: [
      sharedDevelopmentPath.foundation,
      sharedDevelopmentPath.partnerReadiness,
      sharedDevelopmentPath.controlledPilot,
      sharedDevelopmentPath.responsibleExpansion,
    ],
    participationStatement:
      "Chapters, organisers, institutions and cultural bodies may help design responsible future gathering pathways.",
    primaryCallToAction: {
      label: "Explore the Events Vision",
      href: "#capabilities",
    },
    secondaryCallToAction: {
      label: "Discuss an Events Partnership",
      href: "/partners",
      variant: "secondary",
    },
    related: [
      {
        slug: "arts-culture",
        relationship:
          "Future cultural programmes can bring creative work to wider communities.",
      },
      {
        slug: "business",
        relationship:
          "Professional gatherings may support responsible enterprise connection.",
      },
      {
        slug: "research",
        relationship:
          "Knowledge exchange can travel through carefully designed future programmes.",
      },
    ],
  },
} as const satisfies Record<InitiativeSlug, InitiativeDetail>;

const initiativeBySlug = new Map(
  initiatives.map((initiative) => [initiative.slug, initiative]),
);

export function getInitiativeDetail(
  slug: string,
): InitiativeDetail | undefined {
  return initiativeDetails[slug as InitiativeSlug];
}

export function getInitiativeDetailIdentity(slug: InitiativeSlug) {
  const initiative = initiativeBySlug.get(slug);

  if (!initiative) {
    throw new Error(`Missing approved initiative identity for ${slug}`);
  }

  return initiative;
}

export function getInitiativeEcosystemGroup(slug: InitiativeSlug) {
  const group = initiativeOverviewContent.groups.find((entry) =>
    (entry.initiativeSlugs as readonly InitiativeSlug[]).includes(slug),
  );

  if (!group) {
    throw new Error(`Missing ecosystem group for ${slug}`);
  }

  return group as {
    readonly id: InitiativeEcosystemGroupId;
    readonly title: string;
  };
}

export function getInitiativeImageKey(slug: InitiativeSlug): ImageKey {
  return getInitiativeDetailIdentity(slug).imageKey as ImageKey;
}

export const initiativeDetailSlugs = Object.keys(
  initiativeDetails,
) as InitiativeSlug[];
