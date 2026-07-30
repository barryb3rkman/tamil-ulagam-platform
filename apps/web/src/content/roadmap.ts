import type { RoadmapPhase } from "@tamil-ulagam/shared";

export const roadmapPhases = [
  {
    id: "public-foundation",
    number: "01",
    title: "Public Foundation",
    timeframe: "Foundation stage",
    status: "current",
    statusLabel: "Current Build Focus",
    summary:
      "Establish a permanent, trustworthy public presence and the shared product foundation.",
    purpose:
      "Establish a permanent, trustworthy public presence and the shared product foundation.",
    capabilities: [
      "Public website",
      "Approved brand and design system",
      "Bilingual-ready content structure",
      "Initiative and policy communication",
      "Public events, news and resources foundation",
      "Secure content administration foundation",
      "Analytics, accessibility and operational monitoring",
    ],
    dependencies: [],
    readinessGates: [
      "Public information is accurate, accessible and maintainable",
      "Content and design standards can support future platform layers",
    ],
    deliberatelyExcluded: [
      "Member accounts and applications",
      "Operational service marketplaces",
    ],
    linkedRoutes: [
      { label: "About Tamil Ulagam", href: "/about", variant: "text" },
      { label: "Explore Initiatives", href: "/initiatives", variant: "text" },
      { label: "Explore Tamil ID", href: "/tamil-id", variant: "text" },
      { label: "Explore Chapters", href: "/chapters", variant: "text" },
    ],
    category: "foundation",
  },
  {
    id: "identity-and-membership",
    number: "02",
    title: "Identity and Membership",
    timeframe: "Planned next phase",
    status: "future",
    statusLabel: "Planned Next Platform Layer",
    summary:
      "Create the secure member and administrative foundation required for accountable participation.",
    purpose:
      "Create the secure member and administrative foundation required for accountable participation.",
    capabilities: [
      "Authentication",
      "Account recovery",
      "Member profiles",
      "Membership applications and administrative review",
      "Membership categories",
      "Consent and privacy controls",
      "Tamil ID issuance and public status verification",
      "Audit history",
    ],
    dependencies: [
      "Public foundation",
      "Approved membership policy",
      "Privacy and governance readiness",
    ],
    readinessGates: [
      "Defined member data boundaries and consent model",
      "Accountable administrative review and audit processes",
    ],
    deliberatelyExcluded: [
      "Unreviewed membership applications",
      "Unrestricted public member discovery",
    ],
    linkedRoutes: [
      { label: "Explore Tamil ID", href: "/tamil-id", variant: "text" },
    ],
    category: "identity",
  },
  {
    id: "chapters-organisations-events",
    number: "03",
    title: "Chapters, Organisations and Events",
    timeframe: "Planned community layer",
    status: "future",
    statusLabel: "Planned",
    summary:
      "Connect members with accountable local and institutional structures.",
    purpose:
      "Connect members with accountable local and institutional structures.",
    capabilities: [
      "Chapter formation workflows and administration",
      "Organisation registration and verification",
      "Event publishing and discovery",
      "Future registration workflows",
      "Notifications and local announcements",
    ],
    dependencies: [
      "Secure member foundation",
      "Approved chapter governance",
      "Verified organisation model",
    ],
    readinessGates: [
      "Defined local authority and escalation paths",
      "Responsible event and moderation processes",
    ],
    deliberatelyExcluded: [
      "Unverified organisations",
      "Open chapter applications without governance review",
    ],
    linkedRoutes: [
      { label: "Explore Chapters", href: "/chapters", variant: "text" },
      { label: "Partnership Vision", href: "/partners", variant: "text" },
      { label: "Explore Events", href: "/events", variant: "text" },
    ],
    category: "community",
  },
  {
    id: "knowledge-wellbeing-opportunity",
    number: "04",
    title: "Knowledge, Wellbeing and Opportunity Services",
    timeframe: "Future controlled pilots",
    status: "future",
    statusLabel: "Future Controlled Pilots",
    summary:
      "Introduce selected service initiatives through verified partners and controlled pilots.",
    purpose:
      "Introduce selected service initiatives through verified partners and controlled pilots.",
    capabilities: [
      "Education",
      "Healthcare discovery",
      "Business networking",
      "Jobs and careers",
      "Research and knowledge",
      "Tourism and hospitality",
      "Arts and culture",
      "Global events",
    ],
    dependencies: [
      "Trusted membership and administration",
      "Verified partners",
      "Controlled pilot design",
    ],
    readinessGates: [
      "Qualified service supply and support ownership",
      "A pilot plan appropriate to each initiative",
    ],
    deliberatelyExcluded: [
      "A simultaneous launch of every initiative",
      "Unverified service or provider listings",
    ],
    linkedRoutes: [
      { label: "Explore Initiatives", href: "/initiatives", variant: "text" },
    ],
    category: "services",
  },
  {
    id: "mobile-access-member-communication",
    number: "05",
    title: "Mobile Access and Member Communication",
    timeframe: "Future platform layer",
    status: "future",
    statusLabel: "Future Platform Layer",
    summary: "Extend stable member experiences to mobile platforms.",
    purpose: "Extend stable member experiences to mobile platforms.",
    capabilities: [
      "Secure mobile sign-in",
      "Tamil ID access",
      "Chapter updates and event notifications",
      "Community announcements",
      "Member settings and privacy controls",
      "Opportunity discovery",
    ],
    dependencies: [
      "Stable member foundation",
      "Proven communication workflows",
      "Privacy controls",
    ],
    readinessGates: [
      "Reliable member services across supported devices",
      "Clear support and incident processes for mobile access",
    ],
    deliberatelyExcluded: [
      "A public app-store release date",
      "Mobile features that bypass platform governance",
    ],
    linkedRoutes: [
      { label: "Explore Tamil ID", href: "/tamil-id", variant: "text" },
      { label: "Explore Chapters", href: "/chapters", variant: "text" },
    ],
    category: "mobile",
  },
  {
    id: "responsible-global-expansion",
    number: "06",
    title: "Responsible Global Expansion",
    timeframe: "Long-term direction",
    status: "future",
    statusLabel: "Long-Term Direction",
    summary:
      "Scale proven systems while improving resilience, relevance and international operations.",
    purpose:
      "Scale proven systems while improving resilience, relevance and international operations.",
    capabilities: [
      "Regional operational support",
      "Expanded verified partnerships",
      "Responsible recommendations and discovery",
      "Multilingual expansion",
      "Improved analytics",
      "Disaster recovery",
      "Performance and reliability improvements",
      "Mature trust and safety operations",
    ],
    dependencies: [
      "Demonstrated value",
      "Operational readiness",
      "Country-aware review",
    ],
    readinessGates: [
      "Proven quality and support across earlier phases",
      "Sustainable operational capacity for responsible expansion",
    ],
    deliberatelyExcluded: [
      "Unapproved regional launch plans",
      "Expansion based on appearance rather than readiness",
    ],
    linkedRoutes: [
      { label: "About Tamil Ulagam", href: "/about", variant: "text" },
      { label: "Roadmap", href: "/roadmap", variant: "text" },
    ],
    category: "expansion",
  },
] as const satisfies readonly RoadmapPhase[];
