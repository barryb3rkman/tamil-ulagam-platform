import type { RoadmapPhase } from "@tamil-ulagam/shared";

export const roadmapPhases = [
  {
    id: "public-foundation",
    title: "Permanent public foundation",
    timeframe: "Current phase",
    status: "current",
    summary:
      "Establish the public website, trusted information architecture, design system, and engineering standards.",
    capabilities: [
      "Accessible public website shell",
      "Typed content and image architecture",
      "Documented security and delivery principles",
    ],
  },
  {
    id: "community-infrastructure",
    title: "Community infrastructure",
    timeframe: "Future phase",
    status: "future",
    summary:
      "Design identity, membership, chapter, and organisation capabilities after governance and requirements are confirmed.",
    capabilities: [
      "Tamil ID and membership planning",
      "Chapter and organisation foundations",
      "Privacy and authorization design",
    ],
  },
  {
    id: "service-ecosystem",
    title: "Service ecosystem",
    timeframe: "Future phase",
    status: "future",
    summary:
      "Introduce individual services incrementally, with qualified partners and fit-for-purpose controls.",
    capabilities: [
      "Events and opportunity services",
      "Education and knowledge services",
      "Business and community services",
    ],
  },
] as const satisfies readonly RoadmapPhase[];
