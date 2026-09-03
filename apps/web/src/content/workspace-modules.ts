export interface WorkspaceModule {
  readonly id: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly description: string;
}

export const workspaceModules: readonly WorkspaceModule[] = [
  {
    id: "events",
    label: "Events",
    shortLabel: "Events",
    description: "Tamil Ulagam gatherings, celebrations, and programming.",
  },
  {
    id: "opportunities",
    label: "Opportunities & Jobs",
    shortLabel: "Opportunities",
    description: "Career and volunteer opportunities across the federation.",
  },
  {
    id: "services",
    label: "Services",
    shortLabel: "Services",
    description: "Practical services Tamil Ulagam organisations offer.",
  },
  {
    id: "community-programmes",
    label: "Community Programmes",
    shortLabel: "Community",
    description: "Ongoing community-led programmes and initiatives.",
  },
  {
    id: "cultural-programmes",
    label: "Cultural Programmes",
    shortLabel: "Culture",
    description: "Tamil language, arts, and cultural programming.",
  },
  {
    id: "education",
    label: "Education",
    shortLabel: "Education",
    description: "Learning programmes for students, educators, and families.",
  },
  {
    id: "business",
    label: "Business & Networking",
    shortLabel: "Business",
    description: "Professional and business connections across the diaspora.",
  },
  {
    id: "healthcare",
    label: "Healthcare & Community Support",
    shortLabel: "Healthcare",
    description: "Health resources and community support networks.",
  },
  {
    id: "research",
    label: "Research & Knowledge",
    shortLabel: "Research",
    description: "Tamil scholarship, research, and knowledge-sharing.",
  },
  {
    id: "heritage-arts",
    label: "Heritage & Arts",
    shortLabel: "Heritage",
    description: "Preserving and showcasing Tamil heritage and the arts.",
  },
  {
    id: "partnerships",
    label: "Partnership & Collaboration Programmes",
    shortLabel: "Partnerships",
    description:
      "Institutional partnerships and cross-organisation collaboration.",
  },
] as const;

export function findWorkspaceModule(id: string): WorkspaceModule | null {
  return workspaceModules.find((module) => module.id === id) ?? null;
}
