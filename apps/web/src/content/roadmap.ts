import type { RoadmapPhase } from "@tamil-ulagam/shared";

export const roadmapPhases = [
  {
    id: "foundation",
    number: "01",
    title: "Foundation",
    timeframe: "Phase 1 · In development",
    status: "current",
    statusLabel: "In Development",
    summary:
      "Establish the public website and prepare the first membership, chapter and initiative foundations.",
    purpose:
      "Create a trusted public foundation while preparing the PPT’s first platform priorities for responsible introduction.",
    capabilities: [
      "Public website",
      "Proposed mobile application",
      "Tamil ID and digital membership concept",
      "Proposed founding chapters",
      "Proposed healthcare and education pilots",
    ],
    dependencies: [
      "Approved membership and Tamil ID rules",
      "Chapter formation approval",
      "Healthcare and education partner readiness",
    ],
    readinessGates: [
      "Each capability is clearly labelled as current, planned or proposed",
      "Safety and legal requirements are completed before operational launch",
    ],
    deliberatelyExcluded: [
      "Unapproved public launch dates",
      "Claims that proposed services are already available",
    ],
    linkedRoutes: [
      { label: "Explore Tamil ID", href: "/tamil-id", variant: "text" },
      { label: "Explore Chapters", href: "/chapters", variant: "text" },
      { label: "Explore Initiatives", href: "/initiatives", variant: "text" },
    ],
    category: "foundation",
  },
  {
    id: "connected-community",
    number: "02",
    title: "Connected Community",
    timeframe: "Phase 2 · Future phase",
    status: "future",
    statusLabel: "Future Phase",
    summary:
      "Broaden the chapter network and connect business, jobs, awards and membership growth initiatives.",
    purpose:
      "Connect more communities and create planned pathways for enterprise, careers and recognition.",
    capabilities: [
      "Broader proposed chapter network",
      "Business directory and marketplace concepts",
      "Jobs portal and matching concepts",
      "Proposed awards programme",
      "Membership growth ambition",
    ],
    dependencies: [
      "A stable public and membership foundation",
      "Approved chapter and partner participation",
      "Operational ownership for business, jobs and awards",
    ],
    readinessGates: [
      "Partner and service claims are evidenced before publication",
      "Business, employment and awards rules are approved before launch",
    ],
    deliberatelyExcluded: [
      "Unverified employers, businesses or award recipients",
      "Unresolved numerical membership targets",
    ],
    linkedRoutes: [
      {
        label: "Explore Business",
        href: "/initiatives/business",
        variant: "text",
      },
      { label: "Explore Jobs", href: "/initiatives/jobs", variant: "text" },
      {
        label: "Explore Arts & Culture",
        href: "/initiatives/arts-culture",
        variant: "text",
      },
    ],
    category: "community",
  },
  {
    id: "global-services",
    number: "03",
    title: "Global Services",
    timeframe: "Phase 3 · Future phase",
    status: "future",
    statusLabel: "Future Phase",
    summary:
      "Pursue wider chapter connection, a global summit and responsible heritage collaboration.",
    purpose:
      "Advance the PPT’s long-term global ambition only after earlier foundations have demonstrated value and readiness.",
    capabilities: [
      "Proposed global chapter expansion",
      "Long-term membership ambition",
      "Proposed annual global summit",
      "Heritage partnership ambition",
      "Responsible expansion of proven initiatives",
    ],
    dependencies: [
      "Proven community value and sustainable operations",
      "Confirmed institutional relationships",
      "Approved global expansion plan",
    ],
    readinessGates: [
      "Named relationships are confirmed in writing",
      "Targets have evidence, definitions and accountable owners",
    ],
    deliberatelyExcluded: [
      "The PPT’s unresolved one-crore target date",
      "Unconfirmed heritage or institutional partnerships",
    ],
    linkedRoutes: [
      {
        label: "Explore Global Events",
        href: "/initiatives/global-events",
        variant: "text",
      },
      { label: "Explore Partners", href: "/partners", variant: "text" },
    ],
    category: "expansion",
  },
] as const satisfies readonly RoadmapPhase[];
