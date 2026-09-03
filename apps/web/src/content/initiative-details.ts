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
      "The Healthcare initiative brings trusted discovery, community support, qualified professionals, responsible institutions and wellbeing partners into one community-centred vision.",
    whyThisMatters: {
      heading: "Care, language and trust belong together.",
      statement:
        "This initiative brings relevant professionals, wellbeing resources and accountable collaboration closer to Tamil communities without replacing clinical care or making medical promises.",
    },
    conceptStatement: "Tamil Ulagam healthcare initiative.",
    safetyNotice:
      "Tamil Ulagam is not an emergency or crisis-support service and does not provide medical care or telemedicine. For emergencies, contact local emergency services.",
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
          "Professional discovery shaped around location, speciality, language support and responsible verification.",
      },
      {
        title: "Telemedicine",
        description:
          "Remote consultation pathways require qualified providers, clinical governance and country-specific approval.",
      },
      {
        title: "Health camps",
        description:
          "Community health camps depend on qualified local partners and appropriate clinical safeguards.",
      },
      {
        title: "Mental-health support",
        description:
          "Mental-health resources require qualified oversight and clear crisis-support boundaries.",
      },
      {
        title: "Hospital partnerships and Tamil health resources",
        description:
          "Hospital collaboration and reviewed Tamil-language resources require confirmed relationships, clinical responsibility and clear scope.",
      },
    ],
    participationHeading: "Help shape a responsible Tamil healthcare network.",
    participationStatement:
      "Healthcare professionals, institutions and wellbeing organisations can help shape safe, culturally aware community pathways.",
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
          "Community programmes can bring wellbeing conversations together responsibly.",
      },
    ],
    finalCtaHeading:
      "Trusted healthcare pathways begin with responsible participation.",
  },
  education: {
    slug: "education",
    layout: "human-development",
    heroStatement:
      "Learning that strengthens identity and expands opportunity.",
    introduction:
      "The Education initiative brings Tamil language, cultural knowledge, mentorship, learning resources and opportunity discovery into one connected ecosystem.",
    whyThisMatters: {
      heading: "Learning that strengthens identity and opportunity.",
      statement:
        "The initiative connects learners, families, educators and institutions through carefully governed learning, mentorship and opportunity pathways.",
    },
    conceptStatement: "Tamil Ulagam education initiative.",
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
          "Language-learning resources and trusted educational connections across countries and generations.",
      },
      {
        title: "K–12 resources",
        description:
          "School-age resources shaped by curriculum, rights and safeguarding review.",
      },
      {
        title: "Scholarship database",
        description:
          "Scholarship and eligibility information organised for clear, responsible discovery.",
      },
      {
        title: "Tuition marketplace",
        description:
          "A discovery layer for verified mentors and tutors with strong safeguarding standards.",
      },
      {
        title: "Cultural modules",
        description:
          "Learning modules connecting Tamil language with literature, history, arts and heritage.",
      },
      {
        title: "University partnerships",
        description:
          "Institutions could help shape responsible programmes, content and access models.",
      },
    ],
    participationHeading: "Help strengthen Tamil learning across generations.",
    participationStatement:
      "Educators, schools, universities and mentors contribute expertise to a considered global learning ecosystem.",
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
          "Research strengthens the quality and context of learning resources.",
      },
      {
        slug: "arts-culture",
        relationship:
          "Creative practice and heritage are essential pathways for cultural learning.",
      },
      {
        slug: "jobs",
        relationship:
          "Learning and mentorship support career confidence and opportunity.",
      },
    ],
    finalCtaHeading:
      "A strong education ecosystem grows through trusted educators and partners.",
  },
  business: {
    slug: "business",
    layout: "opportunity",
    heroStatement: "Trusted connections for Tamil enterprise across borders.",
    introduction:
      "The Business initiative brings Tamil-owned businesses, founders, professionals, institutions and responsible collaborators into one cross-border network.",
    whyThisMatters: {
      heading: "Stronger enterprise begins with trusted connections.",
      statement:
        "The network centres trust, discovery and accountable collaboration across Tamil enterprise and professional communities.",
    },
    conceptStatement: "Tamil Ulagam business networking initiative.",
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
          "Responsible verification makes business discovery clearer and more trustworthy.",
      },
      {
        title: "B2B and B2C marketplace",
        description:
          "Business and consumer discovery supported by clear participation, identity and commercial controls.",
      },
      {
        title: "Mentorship",
        description:
          "Knowledge exchange between experienced professionals and emerging founders.",
      },
      {
        title: "Investment matchmaking",
        description:
          "Responsible introductions shaped by financial, legal and eligibility controls.",
      },
      {
        title: "Tamil Business Summit",
        description:
          "A global forum for Tamil founders, institutions and professional communities.",
      },
      {
        title: "CSR collaboration",
        description:
          "Corporate collaboration connected to clearly defined community purpose and accountable participants.",
      },
    ],
    participationHeading:
      "Help build responsible pathways for Tamil enterprise.",
    participationStatement:
      "Founders, business associations and professional organisations help define trustworthy participation standards.",
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
          "Hospitality and heritage discovery can support responsible local enterprise.",
      },
      {
        slug: "global-events",
        relationship:
          "Gatherings create space for responsible professional connection.",
      },
    ],
    finalCtaHeading:
      "A trusted business network grows through credible participation.",
  },
  jobs: {
    slug: "jobs",
    layout: "opportunity",
    heroStatement:
      "Connecting Tamil talent with meaningful global opportunity.",
    introduction:
      "The Jobs initiative defines accountable pathways among verified employers, professionals, students and career-development partners within a global careers vision.",
    whyThisMatters: {
      heading: "Meaningful opportunity requires trust on both sides.",
      statement:
        "The initiative establishes accountable pathways between talent, employers, guidance and meaningful opportunity.",
    },
    conceptStatement: "Tamil Ulagam jobs and careers initiative.",
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
          "Suitable opportunities organised within one connected Tamil community platform.",
      },
      {
        title: "Job listings",
        description:
          "Opportunity publishing shaped by accountable employer verification.",
      },
      {
        title: "Bilingual profiles",
        description:
          "Tamil and English profiles that communicate relevant experience and skills clearly.",
      },
      {
        title: "Internships",
        description:
          "Internship discovery for students and early-career professionals.",
      },
      {
        title: "Employer listings",
        description:
          "Employer participation would require clear identity, listing and accountability controls.",
      },
      {
        title: "Cross-border matching",
        description:
          "Cross-border discovery without promises of employment outcomes.",
      },
      {
        title: "AI-powered matching",
        description:
          "AI-assisted matching guided by transparency, fairness testing and human oversight.",
      },
    ],
    participationHeading: "Help shape a responsible global careers network.",
    participationStatement:
      "Employers, recruiters, mentors and training organisations help establish a transparent careers model.",
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
          "Learning and mentorship help people prepare for meaningful opportunity.",
      },
      {
        slug: "business",
        relationship:
          "Verified organisations are essential to meaningful career pathways.",
      },
      {
        slug: "research",
        relationship:
          "Evidence and transparent design strengthen responsible career matching.",
      },
    ],
    finalCtaHeading: "Meaningful careers grow through trusted participation.",
  },
  research: {
    slug: "research",
    layout: "knowledge-global",
    heroStatement: "Connecting Tamil knowledge, scholarship and discovery.",
    introduction:
      "The Research & Innovation initiative brings preservation, collaboration, discovery and responsible innovation into one knowledge ecosystem.",
    whyThisMatters: {
      heading: "Knowledge grows when people and institutions connect.",
      statement:
        "The initiative connects scholars, institutions and communities around knowledge with transparent provenance, responsible attribution and shared context.",
    },
    conceptStatement: "Tamil Ulagam research and innovation initiative.",
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
          "Tamil research and cultural knowledge organised with appropriate rights and provenance.",
      },
      {
        title: "Research grants",
        description:
          "Grant pathways grounded in transparent funding, criteria and administration.",
      },
      {
        title: "Academic collaboration",
        description:
          "Researchers and institutions may explore responsible collaboration across disciplines and countries.",
      },
      {
        title: "Annual research conference",
        description:
          "A global forum for research exchange, collaboration and responsible innovation.",
      },
      {
        title: "University partnerships",
        description:
          "Institutional collaboration across disciplines and countries without implying named relationships.",
      },
      {
        title: "Open-access Tamil library",
        description:
          "Knowledge access shaped by copyright, attribution and cultural context.",
      },
    ],
    participationHeading:
      "Help connect Tamil scholarship and responsible innovation.",
    participationStatement:
      "Scholars, archivists, institutions and technologists contribute to responsible knowledge foundations.",
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
          "Research deepens learning resources and educational context.",
      },
      {
        slug: "arts-culture",
        relationship:
          "Cultural preservation depends on respectful documentation and attribution.",
      },
      {
        slug: "global-events",
        relationship:
          "Global gatherings help knowledge travel between institutions and communities.",
      },
    ],
    finalCtaHeading: "Tamil knowledge grows through trusted collaboration.",
  },
  tourism: {
    slug: "tourism",
    layout: "opportunity",
    heroStatement:
      "Helping the diaspora discover Tamil places, heritage and hospitality.",
    introduction:
      "The Tourism & Hospitality initiative brings diaspora visitors, Tamil heritage, destinations, hospitality providers and authentic cultural experiences into one responsible vision.",
    whyThisMatters: {
      heading: "Heritage journeys should be authentic and responsible.",
      statement:
        "The initiative brings responsible discovery and cultural context together, helping heritage journeys remain authentic and locally grounded.",
    },
    conceptStatement: "Tamil Ulagam tourism and hospitality initiative.",
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
          "Discovery that connects people with places of Tamil cultural and historical significance.",
      },
      {
        title: "Tamil homestays",
        description:
          "Homestay discovery shaped by provider verification, safety and local legal review.",
      },
      {
        title: "Diaspora heritage tours",
        description:
          "Journeys helping diaspora visitors explore Tamil heritage with cultural context.",
      },
      {
        title: "Virtual tours",
        description:
          "Digital experiences making selected heritage places accessible around the world.",
      },
      {
        title: "Tamil cuisine",
        description:
          "Responsible discovery of Tamil culinary traditions and their local context.",
      },
      {
        title: "Tourism-board partnerships",
        description:
          "Institutional collaboration described without implying an official or confirmed relationship.",
      },
    ],
    participationHeading: "Help shape authentic Tamil heritage journeys.",
    participationStatement:
      "Heritage bodies, hospitality providers and local communities help shape a respectful discovery model.",
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
          "Global gatherings create meaningful reasons to explore Tamil places.",
      },
    ],
    finalCtaHeading:
      "Authentic heritage journeys begin with responsible local participation.",
  },
  "arts-culture": {
    slug: "arts-culture",
    layout: "knowledge-global",
    heroStatement:
      "A global stage for Tamil creativity, heritage and expression.",
    introduction:
      "The Arts, Music & Culture initiative brings classical and contemporary artists, archives, institutions, discovery and recognition into one cultural ecosystem.",
    whyThisMatters: {
      heading: "Tamil creativity deserves respectful global visibility.",
      statement:
        "The initiative supports respectful visibility, preservation and cultural context across classical and contemporary expression.",
    },
    conceptStatement: "Tamil Ulagam arts, music and culture initiative.",
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
          "Artist and cultural-organisation discovery guided by consent and responsible attribution.",
      },
      {
        title: "Performances and broadcasts",
        description:
          "Performances and broadcasts shaped by programme approval and media permissions.",
      },
      {
        title: "Digital arts gallery",
        description:
          "Tamil creative work presented with artist consent, attribution and context.",
      },
      {
        title: "Awards and recognition",
        description:
          "Recognition shaped by transparent criteria, responsible selection and cultural breadth.",
      },
      {
        title: "Film, literature and folk traditions",
        description:
          "Classical and contemporary traditions connected across generations.",
      },
      {
        title: "Youth arts programmes",
        description:
          "Youth participation grounded in consent, safeguarding and responsible educational relationships.",
      },
    ],
    participationHeading:
      "Help create a trusted global stage for Tamil expression.",
    participationStatement:
      "Artists, teachers, heritage organisations and cultural institutions establish respectful pathways for expression.",
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
          "Global gatherings provide a thoughtful stage for Tamil creativity.",
      },
    ],
    finalCtaHeading:
      "Tamil creativity reaches the world through trusted participation.",
  },
  "global-events": {
    slug: "global-events",
    layout: "knowledge-global",
    heroStatement:
      "Bringing Tamil communities together across cities and continents.",
    introduction:
      "The Global Events initiative brings federation programmes, chapter gatherings, cultural events, professional summits and educational participation into one shared programme vision.",
    whyThisMatters: {
      heading: "Global participation begins with trusted gatherings.",
      statement:
        "The initiative brings responsible discovery, clear participation and accountable organisers together across global Tamil gatherings.",
    },
    conceptStatement: "Tamil Ulagam global events initiative.",
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
          "An annual celebration connecting Tamil communities around the world.",
      },
      {
        title: "Pongal celebrations",
        description:
          "Chapter and community celebrations rooted in local Tamil culture.",
      },
      {
        title: "Tamil New Year gala",
        description:
          "A cultural gathering celebrating renewal, community and Tamil identity.",
      },
      {
        title: "Global Tamil Summit",
        description:
          "A forum for community, institutional and professional connection.",
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
    ],
    participationHeading:
      "Help shape trusted Tamil gatherings across the world.",
    participationStatement:
      "Chapters, organisers, institutions and cultural bodies shape responsible gathering pathways.",
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
          "Cultural programmes bring creative work to wider communities.",
      },
      {
        slug: "business",
        relationship:
          "Professional gatherings may support responsible enterprise connection.",
      },
      {
        slug: "research",
        relationship:
          "Knowledge exchange travels through carefully designed global programmes.",
      },
    ],
    finalCtaHeading:
      "Global Tamil gatherings grow through responsible organisers and partners.",
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
  return getInitiativeDetailIdentity(slug).imageKey;
}

export const initiativeDetailSlugs = Object.keys(
  initiativeDetails,
) as InitiativeSlug[];
