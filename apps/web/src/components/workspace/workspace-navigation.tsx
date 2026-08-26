"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { WorkspaceType } from "@/features/workspace/workspace-options";

interface NavItem {
  readonly label: string;
  readonly href: string;
  /** Matched by pathname prefix rather than exact equality, so the
   * People sub-route still highlights its parent tab. */
  readonly matchPrefix: string;
}

/**
 * Purpose-specific navigation per workspace type (brief section 11).
 * Only tabs that map to routes that actually exist — no fabricated
 * Registration/Events tabs. Organisation and Sangam share the People
 * route exactly (brief section 16); each still gets its own href so the
 * currently-selected entity id travels with the tab.
 */
function navItemsFor(
  type: WorkspaceType | null,
  entityId: string | null,
): readonly NavItem[] {
  if (type === "member") {
    return [
      {
        label: "Overview",
        href: "/workspace/member",
        matchPrefix: "/workspace/member",
      },
    ];
  }
  if (type === "organisation" && entityId) {
    return [
      {
        label: "Overview",
        href: `/workspace/organisation?organization=${entityId}`,
        matchPrefix: "/workspace/organisation",
      },
      {
        label: "People",
        href: `/workspace/organisation/people?organization=${entityId}`,
        matchPrefix: "/workspace/organisation/people",
      },
    ];
  }
  if (type === "sangam" && entityId) {
    return [
      {
        label: "Overview",
        href: `/workspace/sangam?sangam=${entityId}`,
        matchPrefix: "/workspace/sangam",
      },
      {
        label: "People",
        href: `/workspace/organisation/people?organization=${entityId}`,
        matchPrefix: "/workspace/organisation/people",
      },
    ];
  }
  return [];
}

export interface WorkspaceNavigationProps {
  readonly type: WorkspaceType | null;
  readonly entityId: string | null;
  readonly className?: string;
}

export function WorkspaceNavigation({
  type,
  entityId,
  className,
}: WorkspaceNavigationProps) {
  const pathname = usePathname();
  const items = navItemsFor(type, entityId);
  if (items.length === 0) return null;

  return (
    <nav aria-label="Workspace navigation" className={className}>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          // Overview must not also match /workspace/organisation/people,
          // so its own matchPrefix comparison is exact for the Overview
          // route while People-style tabs use a real prefix match.
          const current =
            item.matchPrefix === pathname ||
            (item.label !== "Overview" &&
              pathname.startsWith(item.matchPrefix));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`focus-visible:ring-focus motion-control rounded-button inline-flex min-h-10 items-center px-3.5 text-sm font-semibold ${
                  current
                    ? "bg-global-navy text-white"
                    : "text-global-navy hover:bg-global-navy/8"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
