import type { InitiativeEntry } from "@tamil-ulagam/shared";

export const initiatives = [
  {
    slug: "healthcare",
    title: "Healthcare",
    shortDescription:
      "Trusted pathways to health information and community support.",
    description:
      "A responsible healthcare vision centred on trusted discovery, safeguarding and collaboration with qualified organisations.",
    status: "planned",
    href: "/initiatives/healthcare",
    imageKey: "initiativeHealthcare",
  },
  {
    slug: "education",
    title: "Education",
    shortDescription:
      "Connections between learners, educators and Tamil knowledge.",
    description:
      "An education ecosystem connecting language learning, cultural knowledge, mentorship and institutional collaboration.",
    status: "planned",
    href: "/initiatives/education",
    imageKey: "initiativeEducation",
  },
  {
    slug: "business",
    title: "Business",
    shortDescription:
      "Trusted enterprise and professional connections across borders.",
    description:
      "A responsible network for Tamil-owned businesses, founders, professionals and institutional collaboration.",
    status: "planned",
    href: "/initiatives/business",
    imageKey: "initiativeBusiness",
  },
  {
    slug: "jobs",
    title: "Jobs",
    shortDescription:
      "Pathways between Tamil talent, employers and opportunity.",
    description:
      "A trusted careers vision shaped around organisation verification, transparent opportunity and professional guidance.",
    status: "planned",
    href: "/initiatives/jobs",
    imageKey: "initiativeJobs",
  },
  {
    slug: "research",
    title: "Research & Innovation",
    shortDescription:
      "A space for evidence, scholarship and shared global learning.",
    description:
      "A research and knowledge ecosystem for responsible discovery, attribution, preservation and collaboration.",
    status: "planned",
    href: "/initiatives/research",
    imageKey: "initiativeResearch",
  },
  {
    slug: "tourism",
    title: "Tourism & Hospitality",
    shortDescription:
      "Culturally respectful discovery of Tamil places and experiences.",
    description:
      "A responsible discovery platform for Tamil heritage, destinations, hospitality and cultural context.",
    status: "planned",
    href: "/initiatives/tourism",
    imageKey: "initiativeTourism",
  },
  {
    slug: "arts-culture",
    title: "Arts, Music & Culture",
    shortDescription:
      "A global platform for Tamil creativity, heritage and expression.",
    description:
      "A cultural ecosystem for respectful presentation, attribution, discovery and intergenerational access.",
    status: "planned",
    href: "/initiatives/arts-culture",
    imageKey: "initiativeArtsCulture",
  },
  {
    slug: "global-events",
    title: "Global Events",
    shortDescription:
      "Meaningful gatherings connecting Tamil communities worldwide.",
    description:
      "A shared events vision for trusted discovery, cultural programmes, summits and community participation.",
    status: "planned",
    href: "/initiatives/global-events",
    imageKey: "initiativeGlobalEvents",
  },
] as const satisfies readonly InitiativeEntry[];

export type InitiativeSlug = (typeof initiatives)[number]["slug"];
