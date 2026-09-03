import type { EligibleOrganisation } from "@tamil-ulagam/shared";
import { isTamilSangam } from "@tamil-ulagam/shared";

import { organisationLocationLabel } from "@/components/member/organisation-presentation";

export type WorkspaceType = "member" | "organisation" | "sangam" | "admin";

export interface WorkspaceOption {
  readonly type: WorkspaceType;
  readonly id: string;
  readonly label: string;
  readonly subtitle: string;
  readonly href: string;
  readonly current: boolean;
}

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
    pathname === "/dashboard" ||
    pathname === "/dashboard/" ||
    pathname === "/dashboard/account" ||
    pathname === "/dashboard/account/"
  ) {
    return { type: "member", id: "member" };
  }
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
  readonly managedOrganisations: readonly EligibleOrganisation[];
  readonly active: ActiveWorkspace;
}

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
      label: organisation.name || "Organisation registration",
      subtitle: organisationLocationLabel(organisation),
      href: `/workspace/organisation?organization=${organisation.id}`,
      current: active.type === "organisation" && active.id === organisation.id,
    });
  }

  for (const sangam of sangams) {
    options.push({
      type: "sangam",
      id: sangam.id,
      label: sangam.name || "Tamil Sangam registration",
      subtitle: organisationLocationLabel(sangam),
      href: `/workspace/sangam?sangam=${sangam.id}`,
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

export function findCurrentWorkspace(
  options: readonly WorkspaceOption[],
): WorkspaceOption | null {
  return options.find((option) => option.current) ?? null;
}

export function visibleSwitcherOptions(
  options: readonly WorkspaceOption[],
): WorkspaceOption[] {
  const managesWorkspace = options.some(
    (option) => option.type === "organisation" || option.type === "sangam",
  );
  if (!managesWorkspace) return [...options];
  return options.filter((option) => option.type !== "member");
}

export function switcherHasSomewhereToGo(
  visibleOptions: readonly WorkspaceOption[],
): boolean {
  return visibleOptions.some((option) => !option.current);
}
