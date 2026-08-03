import type { CallToAction } from "@tamil-ulagam/shared";

import { type ImageKey } from "@/config/images";

import {
  initiativeOverviewContent,
  type InitiativeEcosystemGroupId,
} from "./initiatives-overview";
import { type InitiativeSlug, initiatives } from "./initiatives";

export type InitiativeDetailLayout =
  "human-development" | "opportunity" | "knowledge-global";

export interface InitiativeRelatedEntry {
  readonly slug: InitiativeSlug;
  readonly relationship: string;
}

export interface InitiativeDetail {
  readonly slug: InitiativeSlug;
  readonly layout: InitiativeDetailLayout;
  readonly heroStatement: string;
  readonly introduction: string;
  readonly whyThisMatters: {
    readonly heading: string;
    readonly statement: string;
  };
  readonly conceptStatement: string;
  readonly safetyNotice?: string;
  readonly audienceHeading: string;
  readonly intendedAudiences: readonly string[];
  readonly capabilities: readonly {
    readonly title: string;
    readonly description: string;
  }[];
  readonly participationHeading: string;
  readonly participationStatement: string;
  readonly finalCtaHeading: string;
  readonly primaryCallToAction: CallToAction;
  readonly secondaryCallToAction: CallToAction;
  readonly related: readonly [
    InitiativeRelatedEntry,
    InitiativeRelatedEntry,
    InitiativeRelatedEntry,
  ];
}

export const initiativeDetails = {
  healthcare: {
    slug: "healthcare",
    layout: "human-development",
    heroStatement:
      "Healthcare support that understands language, culture and community.",
    introduction:
      "Tamil Ulagam is exploring a future trusted discovery and support network shaped with qualified professionals, responsible institutions and community wellbeing partners.",
    whyThisMatters: {
      heading: "A future direction with care at its centre.",
      statement:
        "The proposed initiative would help Tamil communities discover relevant professionals, wellbeing resources and accountable partnerships without replacing clinical care or making medical promises.",
    },
    conceptStatement:
      "Concept visual representing the planned healthcare initiative.",
    safetyNotice:
      "Tamil Ulagam does not currently provide medical care or telemedicine. For emergencies, contact local emergency services.",
    audienceHeading:
      "Designed around people, professionals and community care.",
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
        title: "Tamil-speaking doctor directory",
        description:
          "A proposed way to discover verified healthcare professionals by location, speciality and language support.",
      },
      {
        title: "Telemedicine",
        description:
          "Future remote consultations would require qualified providers, clinical governance and country-specific approval before launch.",
      },
      {
        title: "Health camps",
        description:
          "Proposed community health camps would depend on approved local partners and appropriate clinical safeguards.",
      },
      {
        title: "Mental-health support",
        description:
          "Planned mental-health resources would require qualified oversight and clear crisis-support boundaries.",
      },
      {
        title: "Hospital partnerships and Tamil health resources",
        description:
          "Hospital collaboration and reviewed Tamil-language resources are future ambitions; no relationship or care service is currently active.",
      },
    ],
    participationHeading: "Help shape a responsible Tamil healthcare network.",
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
    finalCtaHeading:
      "A future healthcare initiative needs trusted participation.",
  },
  education: {
    slug: "education",
    layout: "human-development",
    heroStatement:
      "Learning that strengthens identity and expands opportunity.",
    introduction:
      "Tamil Ulagam is shaping a future education ecosystem around Tamil language, cultural knowledge, mentorship, learning resources and opportunity discovery.",
    whyThisMatters: {
      heading: "Learning that strengthens identity and opportunity.",
      statement:
        "The initiative is intended to connect learners, families, educators and institutions through carefully developed pathways rather than claim that courses, scholarships or tutoring are currently available.",
    },
    conceptStatement:
      "Concept visual representing the planned education initiative.",
    audienceHeading: "Built for learners, educators and institutions.",
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
        title: "Tamil language courses",
        description:
          "Future pathways for discovering language-learning resources and trusted educational partners.",
      },
      {
        title: "K–12 resources",
        description:
          "Proposed school-age resources would require curriculum, rights and safeguarding review.",
      },
      {
        title: "Scholarship database",
        description:
          "A future directory could make approved scholarships and eligibility information easier to discover.",
      },
      {
        title: "Tuition marketplace",
        description:
          "A future discovery layer for verified mentors and tutors, subject to safeguarding standards.",
      },
      {
        title: "Cultural modules",
        description:
          "Planned modules could connect Tamil language with literature, history, arts and heritage.",
      },
      {
        title: "University partnerships",
        description:
          "Institutions could help shape responsible programmes, content and access models.",
      },
    ],
    participationHeading: "Help strengthen Tamil learning across generations.",
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
    finalCtaHeading:
      "A future education ecosystem needs trusted educators and partners.",
  },
  business: {
    slug: "business",
    layout: "opportunity",
    heroStatement: "Trusted connections for Tamil enterprise across borders.",
    introduction:
      "Tamil Ulagam is considering a future network for verified Tamil-owned businesses, founders, professionals, institutions and responsible partners.",
    whyThisMatters: {
      heading: "Stronger enterprise begins with trusted connections.",
      statement:
        "The proposed network would focus on trust, discovery and accountable collaboration rather than present active listings, investment offers or commercial services.",
    },
    conceptStatement:
      "Concept visual representing the planned business networking initiative.",
    audienceHeading:
      "Designed for founders, businesses and professional networks.",
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
        title: "Tamil business directory",
        description:
          "A future directory could make it easier to discover businesses after responsible verification.",
      },
      {
        title: "B2B and B2C marketplace",
        description:
          "A future marketplace could support business and consumer discovery; no transactions are currently available.",
      },
      {
        title: "Mentorship",
        description:
          "Planned connections could support knowledge exchange between experienced professionals and emerging founders.",
      },
      {
        title: "Investment matchmaking",
        description:
          "This is a proposed future capability requiring financial, legal and eligibility controls.",
      },
      {
        title: "Tamil Business Summit",
        description:
          "An annual summit is part of the original vision and remains a proposed event without an approved date.",
      },
      {
        title: "CSR collaboration",
        description:
          "Future corporate collaboration would require confirmed participants and an approved community purpose.",
      },
    ],
    participationHeading:
      "Help build responsible pathways for Tamil enterprise.",
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
    finalCtaHeading: "A future business network needs credible participation.",
  },
  jobs: {
    slug: "jobs",
    layout: "opportunity",
    heroStatement:
      "Connecting Tamil talent with meaningful global opportunity.",
    introduction:
      "Tamil Ulagam is exploring a future careers platform for verified employers, professionals, students and career-development partners.",
    whyThisMatters: {
      heading: "Meaningful opportunity requires trust on both sides.",
      statement:
        "The initiative is intended to establish accountable pathways for talent and opportunity, not to present active job listings, applications or employer dashboards today.",
    },
    conceptStatement:
      "Concept visual representing the planned jobs and careers initiative.",
    audienceHeading:
      "Designed around candidates, employers and career partners.",
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
        title: "Tamil job board",
        description:
          "A planned job board could bring suitable opportunities into one Tamil community platform.",
      },
      {
        title: "Job listings",
        description:
          "Employers would need accountable verification before any future opportunity publishing.",
      },
      {
        title: "Bilingual profiles",
        description:
          "Planned Tamil and English profiles could help professionals present relevant experience and skills.",
      },
      {
        title: "Internships",
        description:
          "Future internship discovery could support students and early-career professionals.",
      },
      {
        title: "Employer listings",
        description:
          "Employer participation would require clear identity, listing and accountability controls.",
      },
      {
        title: "Cross-border matching",
        description:
          "Future matching could support discovery across countries without promising employment outcomes.",
      },
      {
        title: "AI-powered matching",
        description:
          "AI-assisted matching is a future concept requiring transparency, fairness testing and human oversight.",
      },
    ],
    participationHeading: "Help shape a responsible global careers network.",
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
    finalCtaHeading: "A future jobs initiative needs trusted participation.",
  },
  research: {
    slug: "research",
    layout: "knowledge-global",
    heroStatement: "Connecting Tamil knowledge, scholarship and discovery.",
    introduction:
      "Tamil Ulagam is considering a future research and knowledge ecosystem for preservation, collaboration, discovery and responsible innovation.",
    whyThisMatters: {
      heading: "Knowledge grows when people and institutions connect.",
      statement:
        "The initiative would help scholars, institutions and communities connect around knowledge with transparent provenance, not claim that a live archive or grant programme already exists.",
    },
    conceptStatement:
      "Concept visual representing the planned research and innovation initiative.",
    audienceHeading:
      "Built for scholars, institutions and knowledge custodians.",
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
        title: "Digital archive",
        description:
          "A planned archive could preserve and organise Tamil research and cultural knowledge with appropriate rights.",
      },
      {
        title: "Research grants",
        description:
          "Future grants remain an ambition and require approved funding, criteria and administration.",
      },
      {
        title: "Academic collaboration",
        description:
          "Researchers and institutions may explore responsible collaboration across disciplines and countries.",
      },
      {
        title: "Annual research conference",
        description:
          "An annual conference is proposed; no programme or date is currently confirmed.",
      },
      {
        title: "University partnerships",
        description:
          "University collaboration is part of the original vision; no named relationship is currently confirmed.",
      },
      {
        title: "Open-access Tamil library",
        description:
          "A future library could improve access while respecting copyright, attribution and context.",
      },
    ],
    participationHeading:
      "Help connect Tamil scholarship and responsible innovation.",
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
    finalCtaHeading: "A future research ecosystem needs trusted collaboration.",
  },
  tourism: {
    slug: "tourism",
    layout: "opportunity",
    heroStatement:
      "Helping the diaspora discover Tamil places, heritage and hospitality.",
    introduction:
      "Tamil Ulagam is exploring a future discovery platform connecting diaspora visitors with Tamil heritage, destinations, hospitality providers and authentic cultural experiences.",
    whyThisMatters: {
      heading: "Heritage journeys should be authentic and responsible.",
      statement:
        "The initiative is intended to support responsible discovery and cultural context, not to present bookings, prices, hotels or itineraries as currently available services.",
    },
    conceptStatement:
      "Concept visual representing the planned tourism and hospitality initiative.",
    audienceHeading:
      "Designed for travellers, communities and responsible hosts.",
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
        title: "Heritage-site guide",
        description:
          "Future discovery could connect people with places of Tamil cultural and historical significance.",
      },
      {
        title: "Tamil homestays",
        description:
          "Homestay discovery is proposed and would require provider, safety and local legal review.",
      },
      {
        title: "Diaspora heritage tours",
        description:
          "Proposed journeys could help diaspora visitors explore Tamil heritage with cultural context.",
      },
      {
        title: "Virtual tours",
        description:
          "Future digital experiences could make selected heritage places accessible around the world.",
      },
      {
        title: "Tamil cuisine",
        description:
          "Planned guides could support responsible discovery of Tamil culinary traditions.",
      },
      {
        title: "Tourism-board partnerships",
        description:
          "Tourism-board collaboration is an ambition; no official relationship is currently confirmed.",
      },
    ],
    participationHeading: "Help shape authentic Tamil heritage journeys.",
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
    finalCtaHeading:
      "A future tourism initiative needs responsible local participation.",
  },
  "arts-culture": {
    slug: "arts-culture",
    layout: "knowledge-global",
    heroStatement:
      "A global stage for Tamil creativity, heritage and expression.",
    introduction:
      "Tamil Ulagam is shaping a future cultural ecosystem for classical and contemporary artists, archives, institutions, discovery and recognition.",
    whyThisMatters: {
      heading: "Tamil creativity deserves respectful global visibility.",
      statement:
        "The initiative is intended to support respectful visibility and preservation without claiming that awards, grants, bookings or a live archive are active today.",
    },
    conceptStatement:
      "Concept visual representing the planned arts, music and culture initiative.",
    audienceHeading: "Created for artists, institutions and audiences.",
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
        title: "Classical arts directory",
        description:
          "A future discovery layer could help people find artists and cultural organisations with consent.",
      },
      {
        title: "Performances and broadcasts",
        description:
          "Future performances and broadcasts would require programme approval and media permissions.",
      },
      {
        title: "Digital arts gallery",
        description:
          "A future gallery could present Tamil creative work with artist consent, attribution and context.",
      },
      {
        title: "Awards and recognition",
        description:
          "Awards are proposed; no annual programme or recipient is currently announced.",
      },
      {
        title: "Film, literature and folk traditions",
        description:
          "Planned coverage could connect classical and contemporary traditions across generations.",
      },
      {
        title: "Youth arts programmes",
        description:
          "Future youth programmes would require consent, safeguarding and responsible educational partners.",
      },
    ],
    participationHeading:
      "Help create a trusted global stage for Tamil expression.",
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
    finalCtaHeading:
      "A future arts and culture initiative needs trusted participation.",
  },
  "global-events": {
    slug: "global-events",
    layout: "knowledge-global",
    heroStatement:
      "Bringing Tamil communities together across cities and continents.",
    introduction:
      "Tamil Ulagam is considering a future platform for federation programmes, chapter gatherings, cultural events, professional summits and educational participation.",
    whyThisMatters: {
      heading: "Global participation begins with trusted gatherings.",
      statement:
        "The initiative would establish responsible discovery and participation foundations before it ever presents live dates, registrations, ticketing or streaming as available.",
    },
    conceptStatement:
      "Concept visual representing the planned global events initiative.",
    audienceHeading: "Built for communities, organisers and participants.",
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
        title: "Tamil Ulagam Day",
        description:
          "A proposed annual celebration connecting Tamil communities around the world.",
      },
      {
        title: "Pongal celebrations",
        description:
          "Proposed chapter and community celebrations; no city programme is currently confirmed.",
      },
      {
        title: "Tamil New Year gala",
        description:
          "A future gathering concept without an approved date, venue or registration process.",
      },
      {
        title: "Global Tamil Summit",
        description:
          "A proposed forum for community, institutional and professional connection.",
      },
      {
        title: "Tamil Heritage Month",
        description:
          "A proposed period of cultural, educational and community programming.",
      },
      {
        title: "Tamil Ulagam Awards Night",
        description:
          "A future recognition event; no awards programme or recipients are currently confirmed.",
      },
    ],
    participationHeading:
      "Help shape trusted Tamil gatherings across the world.",
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
    finalCtaHeading:
      "A future global events platform needs responsible organisers and partners.",
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
