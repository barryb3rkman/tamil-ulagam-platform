import { initiativeDetails } from "./initiative-details";
import type { InitiativeSlug } from "./initiatives";

export interface ModuleCapability {
  readonly title: string;
  readonly description: string;
}

export interface WorkspaceModuleContent {
  readonly tamilLabel: string;
  /** The public initiative this programme belongs to, where there is one.
   *  Gives the module its capabilities and a way through to the full vision,
   *  so the two never drift apart. */
  readonly initiative?: InitiativeSlug;
  /** Written here only for the programmes that have no public initiative
   *  page of their own. Everything else reads from initiativeDetails. */
  readonly ownCapabilities?: readonly ModuleCapability[];
  readonly whatYouCanDoNow: readonly string[];
}

/**
 * What each programme area actually contains.
 *
 * Every module used to render the same "in development" placeholder, so
 * thirteen tiles led to one room. The substance was already in the
 * repository — the initiative pages carry the six capability lines the source
 * presentation sets out for each programme — it simply was not reaching the
 * workspace. This joins them up, and states plainly which parts a member can
 * use today and which are still being built, rather than saying "nothing here
 * yet" about all of it.
 */
export const workspaceModuleContent: Record<string, WorkspaceModuleContent> = {
  events: {
    tamilLabel: "நிகழ்வுகள்",
    initiative: "global-events",
    whatYouCanDoNow: [
      "See the six occasions every chapter carries this year",
      "Find the chapter nearest you and what it runs",
    ],
  },
  opportunities: {
    tamilLabel: "வாய்ப்புகள்",
    initiative: "jobs",
    whatYouCanDoNow: ["Register your organisation so it can post openings"],
  },
  services: {
    tamilLabel: "சேவைகள்",
    initiative: "tourism",
    whatYouCanDoNow: ["Browse the initiative and what it will cover"],
  },
  "community-programmes": {
    tamilLabel: "சமூகத் திட்டங்கள்",
    ownCapabilities: [
      {
        title: "Chapter welfare",
        description:
          "Support run by a chapter for the families in its own city.",
      },
      {
        title: "Youth and student groups",
        description:
          "Programmes for the second generation, led by people who know them.",
      },
      {
        title: "Volunteering",
        description:
          "Members offering time to a chapter's work, coordinated locally.",
      },
      {
        title: "Family gatherings",
        description:
          "The ordinary meeting-up that holds a diaspora community together.",
      },
    ],
    whatYouCanDoNow: [
      "Join an organisation and appear in its member directory",
      "See who else is a member where you are",
    ],
  },
  "cultural-programmes": {
    tamilLabel: "பண்பாட்டுத் திட்டங்கள்",
    initiative: "arts-culture",
    whatYouCanDoNow: ["See the federation's cultural calendar"],
  },
  education: {
    tamilLabel: "கல்வி",
    initiative: "education",
    whatYouCanDoNow: ["Read what the education initiative will cover"],
  },
  business: {
    tamilLabel: "வணிகம்",
    initiative: "business",
    whatYouCanDoNow: ["Register a Tamil-owned business as an organisation"],
  },
  healthcare: {
    tamilLabel: "மருத்துவம்",
    initiative: "healthcare",
    whatYouCanDoNow: ["Read what the healthcare initiative will cover"],
  },
  research: {
    tamilLabel: "ஆய்வு",
    initiative: "research",
    whatYouCanDoNow: ["Read what the research initiative will cover"],
  },
  "heritage-arts": {
    tamilLabel: "பாரம்பரியமும் கலையும்",
    initiative: "arts-culture",
    whatYouCanDoNow: ["See the heritage month programme"],
  },
  partnerships: {
    tamilLabel: "கூட்டிணைவுகள்",
    ownCapabilities: [
      {
        title: "Institutional collaboration",
        description:
          "Universities, cultural bodies and community institutions working with the federation.",
      },
      {
        title: "Chapter partnerships",
        description:
          "Two chapters, or a chapter and a local organisation, running something together.",
      },
      {
        title: "Corporate and CSR",
        description:
          "Companies supporting Tamil community programmes in their own regions.",
      },
      {
        title: "Enquiry review",
        description:
          "Every approach is read by the federation before anything is agreed.",
      },
    ],
    whatYouCanDoNow: ["Send a partnership enquiry through the public site"],
  },
};

/** The capability lines for a module, from its initiative where it has one. */
export function moduleCapabilities(
  moduleId: string,
): readonly ModuleCapability[] {
  const content = workspaceModuleContent[moduleId];
  if (!content) return [];
  if (content.ownCapabilities) return content.ownCapabilities;
  if (!content.initiative) return [];
  return initiativeDetails[content.initiative].capabilities;
}
