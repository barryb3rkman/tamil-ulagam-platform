import type { InitiativeEntry } from "@tamil-ulagam/shared";

export const initiatives = [
  {
    slug: "healthcare",
    title: "Healthcare",
    shortDescription:
      "Exploring trusted pathways to health information and community support.",
    description:
      "This planned initiative is being shaped around responsible access, safeguarding, and collaboration with qualified organisations. No healthcare service is currently offered through this website.",
    status: "planned",
    href: "/initiatives/healthcare",
    imageKey: "initiativeHealthcare",
  },
  {
    slug: "education",
    title: "Education",
    shortDescription:
      "Planning connections between learners, educators, and Tamil knowledge.",
    description:
      "This planned initiative will explore educational access, language learning, and institutional collaboration. Courses and learner services are not currently available.",
    status: "planned",
    href: "/initiatives/education",
    imageKey: "initiativeEducation",
  },
  {
    slug: "business",
    title: "Business",
    shortDescription:
      "Preparing a trustworthy foundation for enterprise and professional connections.",
    description:
      "This planned initiative will consider responsible ways to connect businesses and professionals. Listings, referrals, and commercial services are not currently available.",
    status: "planned",
    href: "/initiatives/business",
    imageKey: "initiativeBusiness",
  },
  {
    slug: "jobs",
    title: "Jobs",
    shortDescription:
      "Designing future pathways between talent, employers, and opportunity.",
    description:
      "This planned initiative will be developed with clear verification and safety standards. Job listings, applications, and recruitment services are not currently available.",
    status: "planned",
    href: "/initiatives/jobs",
    imageKey: "initiativeJobs",
  },
  {
    slug: "research",
    title: "Research",
    shortDescription:
      "Planning a space for evidence, scholarship, and shared global learning.",
    description:
      "This planned initiative will explore how research can be responsibly organised, attributed, and shared. No research repository or funding programme is currently available.",
    status: "planned",
    href: "/initiatives/research",
    imageKey: "initiativeResearch",
  },
  {
    slug: "tourism",
    title: "Tourism",
    shortDescription:
      "Exploring culturally respectful ways to discover Tamil places and experiences.",
    description:
      "This planned initiative will consider trusted destination information and responsible cultural tourism. Booking and travel services are not currently available.",
    status: "planned",
    href: "/initiatives/tourism",
    imageKey: "initiativeTourism",
  },
  {
    slug: "arts-culture",
    title: "Arts & Culture",
    shortDescription:
      "Preparing a global platform for Tamil creativity, heritage, and expression.",
    description:
      "This planned initiative will explore respectful presentation, attribution, and access across art forms. Artist programmes and cultural archives are not currently available.",
    status: "planned",
    href: "/initiatives/arts-culture",
    imageKey: "initiativeArtsCulture",
  },
  {
    slug: "global-events",
    title: "Global Events",
    shortDescription:
      "Planning ways for communities to discover and coordinate meaningful gatherings.",
    description:
      "This planned initiative will consider verified event publishing and chapter coordination. Event submission, registration, and ticketing are not currently available.",
    status: "planned",
    href: "/initiatives/global-events",
    imageKey: "initiativeGlobalEvents",
  },
] as const satisfies readonly InitiativeEntry[];

export type InitiativeSlug = (typeof initiatives)[number]["slug"];

export function getInitiative(slug: string): InitiativeEntry | undefined {
  return initiatives.find((initiative) => initiative.slug === slug);
}
