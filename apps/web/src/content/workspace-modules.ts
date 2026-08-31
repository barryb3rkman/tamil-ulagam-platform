/**
 * The 11 canonical future Tamil Ulagam programme modules (Phase H6
 * brief section 6) — a stable, typed identifier list every module route
 * and every navigation surface (the workspace shell's Programmes panel,
 * each workspace landing page's module-access strip) reads from, so
 * there is exactly one place that ever states what the 11 modules are
 * called.
 *
 * `accent` is a restrained colour-only wayfinding cue (one of the
 * existing supporting design tokens) — deliberately not a bespoke
 * illustrated icon per module: eleven different pictograms risk reading
 * as mismatched decoration, where eleven distinct, already-in-palette
 * accent tones read as one coherent system. Colour is never the sole
 * differentiator — every surface that uses it always shows the label
 * alongside.
 */
export interface WorkspaceModule {
  readonly id: string;
  readonly label: string;
  /** Shorter form for space-constrained nav surfaces; the full `label`
   * is always what a route's own page heading uses. */
  readonly shortLabel: string;
  readonly description: string;
  readonly accent:
    "maroon" | "gold" | "indigo" | "crimson" | "teal" | "success" | "navy";
}

export const workspaceModules: readonly WorkspaceModule[] = [
  {
    id: "events",
    label: "Events",
    shortLabel: "Events",
    description: "Tamil Ulagam gatherings, celebrations, and programming.",
    accent: "maroon",
  },
  {
    id: "opportunities",
    label: "Opportunities & Jobs",
    shortLabel: "Opportunities",
    description: "Career and volunteer opportunities across the federation.",
    accent: "gold",
  },
  {
    id: "services",
    label: "Services",
    shortLabel: "Services",
    description: "Practical services Tamil Ulagam organisations offer.",
    accent: "teal",
  },
  {
    id: "community-programmes",
    label: "Community Programmes",
    shortLabel: "Community",
    description: "Ongoing community-led programmes and initiatives.",
    accent: "indigo",
  },
  {
    id: "cultural-programmes",
    label: "Cultural Programmes",
    shortLabel: "Culture",
    description: "Tamil language, arts, and cultural programming.",
    accent: "crimson",
  },
  {
    id: "education",
    label: "Education",
    shortLabel: "Education",
    description: "Learning programmes for students, educators, and families.",
    accent: "navy",
  },
  {
    id: "business",
    label: "Business & Networking",
    shortLabel: "Business",
    description: "Professional and business connections across the diaspora.",
    accent: "gold",
  },
  {
    id: "healthcare",
    label: "Healthcare & Community Support",
    shortLabel: "Healthcare",
    description: "Health resources and community support networks.",
    accent: "success",
  },
  {
    id: "research",
    label: "Research & Knowledge",
    shortLabel: "Research",
    description: "Tamil scholarship, research, and knowledge-sharing.",
    accent: "teal",
  },
  {
    id: "heritage-arts",
    label: "Heritage & Arts",
    shortLabel: "Heritage",
    description: "Preserving and showcasing Tamil heritage and the arts.",
    accent: "maroon",
  },
  {
    id: "partnerships",
    label: "Partnership & Collaboration Programmes",
    shortLabel: "Partnerships",
    description:
      "Institutional partnerships and cross-organisation collaboration.",
    accent: "indigo",
  },
] as const;

export function findWorkspaceModule(id: string): WorkspaceModule | null {
  return workspaceModules.find((module) => module.id === id) ?? null;
}
