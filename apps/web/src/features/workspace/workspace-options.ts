import type { EligibleOrganisation } from "@tamil-ulagam/shared";
import { isTamilSangam } from "@tamil-ulagam/shared";

import { organisationLocationLabel } from "@/components/member/organisation-presentation";

/**
 * Phase E1 — the typed workspace model (brief sections 3, 4, 24). Four
 * genuinely different contexts, never presented as options in a generic
 * "current organisation" select. Built in one pure, testable layer so no
 * component spreads conditional workspace construction through JSX.
 */
export type WorkspaceType = "member" | "organisation" | "sangam" | "admin";

export interface WorkspaceOption {
  readonly type: WorkspaceType;
  readonly id: string;
  readonly label: string;
  readonly subtitle: string;
  readonly href: string;
  readonly current: boolean;
}

/** The current URL's workspace context — resolved once, from the
 * pathname + query string, and treated as authoritative (brief section
 * 26: the URL is the source of truth, never a hidden global). */
export interface ActiveWorkspace {
  readonly type: WorkspaceType | null;
  readonly id: string | null;
}

export function resolveActiveWorkspace(
  pathname: string,
  searchParams: URLSearchParams | null,
): ActiveWorkspace {
  const params = searchParams ?? new URLSearchParams();
  if (
    pathname === "/workspace/member" ||
    pathname.startsWith("/workspace/member/")
  ) {
    return { type: "member", id: "member" };
  }
  if (
    pathname === "/workspace/sangam" ||
    pathname.startsWith("/workspace/sangam/")
  ) {
    return { type: "sangam", id: params.get("sangam") };
  }
  if (
    pathname === "/workspace/organisation" ||
    pathname.startsWith("/workspace/organisation/")
  ) {
    return { type: "organisation", id: params.get("organization") };
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return { type: "admin", id: "admin" };
  }
  return { type: null, id: null };
}

export interface WorkspaceOptionsInput {
  readonly isAuthenticated: boolean;
  readonly canReviewApplications: boolean;
  /** Every organisation the caller manages — a management grant
   * (`organization_managers`), never derived from membership/affiliation
   * data (brief section 8). Includes drafts: a management grant is
   * created the moment a registration draft exists, so this single list
   * is a complete, lifecycle-independent signal. */
  readonly managedOrganisations: readonly EligibleOrganisation[];
  readonly active: ActiveWorkspace;
}

/**
 * The single function that builds the full, flat list of available
 * workspaces from real data (brief sections 7, 8, 24) — Organisation and
 * Tamil Sangam are split via the shared `isTamilSangam` predicate
 * (never a name-based guess), Admin is gated strictly on
 * `canReviewApplications`, and Member is available whenever
 * authenticated. Order is stable: Member, Organisations, Sangams, Admin.
 */
export function buildWorkspaceOptions(
  input: WorkspaceOptionsInput,
): WorkspaceOption[] {
  const {
    isAuthenticated,
    canReviewApplications,
    managedOrganisations,
    active,
  } = input;
  if (!isAuthenticated) return [];

  const options: WorkspaceOption[] = [
    {
      type: "member",
      id: "member",
      label: "Member",
      subtitle: "Personal membership workspace",
      href: "/workspace/member",
      current: active.type === "member",
    },
  ];

  const organisations = managedOrganisations.filter(
    (organisation) => !isTamilSangam(organisation),
  );
  const sangams = managedOrganisations.filter((organisation) =>
    isTamilSangam(organisation),
  );

  for (const organisation of organisations) {
    options.push({
      type: "organisation",
      id: organisation.id,
      label: organisation.name || "Untitled organisation",
      subtitle: organisationLocationLabel(organisation),
      href: `/workspace/organisation?organization=${organisation.id}`,
      current: active.type === "organisation" && active.id === organisation.id,
    });
  }

  for (const sangam of sangams) {
    options.push({
      type: "sangam",
      id: sangam.id,
      label: sangam.name || "Untitled Tamil Sangam",
      subtitle: organisationLocationLabel(sangam),
      href: `/workspace/sangam?sangam=${sangam.id}`,
      // People has no dedicated /workspace/sangam/people route — a
      // Sangam manager reaches it via the shared
      // /workspace/organisation/people?organization=<id> path (see
      // sangam-registration-lifecycle.spec.ts), so resolveActiveWorkspace
      // reports active.type as "organisation" there even for a Sangam.
      // Matching by id alone whenever active.type is "organisation" is
      // safe — organisation and Sangam ids are both real, unique
      // `organizations.id` values, so no id can collide across kinds.
      // Without this, a Sangam manager's own People page showed
      // "Unavailable workspace" in the header despite full, correct
      // access (found during H4 visual QA).
      current:
        (active.type === "sangam" || active.type === "organisation") &&
        active.id === sangam.id,
    });
  }

  if (canReviewApplications) {
    options.push({
      type: "admin",
      id: "admin",
      label: "Federation Admin",
      subtitle: "Review and verify registrations",
      href: "/admin",
      current: active.type === "admin",
    });
  }

  return options;
}

export interface GroupedWorkspaceOptions {
  readonly member: WorkspaceOption | null;
  readonly organisations: readonly WorkspaceOption[];
  readonly sangams: readonly WorkspaceOption[];
  readonly admin: WorkspaceOption | null;
}

/** Groups a flat option list for the switcher's sectioned rendering
 * (brief's illustrative Member / Organisations / Tamil Sangams /
 * Federation structure) — a section with no entries is simply absent so
 * a switcher never shows a meaningless empty heading (brief section 29). */
export function groupWorkspaceOptions(
  options: readonly WorkspaceOption[],
): GroupedWorkspaceOptions {
  return {
    member: options.find((option) => option.type === "member") ?? null,
    organisations: options.filter((option) => option.type === "organisation"),
    sangams: options.filter((option) => option.type === "sangam"),
    admin: options.find((option) => option.type === "admin") ?? null,
  };
}

/** The workspace currently active, if it is still in the caller's
 * available list — used to render "You are managing: X" and to detect a
 * stale/invalid workspace link (brief section 28: an id present in the
 * URL but absent from this list means access was lost or the link is
 * bad, never a silent fallback to a different organisation). */
export function findCurrentWorkspace(
  options: readonly WorkspaceOption[],
): WorkspaceOption | null {
  return options.find((option) => option.current) ?? null;
}
