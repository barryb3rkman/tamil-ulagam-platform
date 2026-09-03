"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { WorkspaceType } from "@/features/workspace/workspace-options";

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly matchPrefix: string;
  readonly icon: "overview" | "people";
}

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
        icon: "overview",
      },
    ];
  }
  if (type === "organisation" && entityId) {
    return [
      {
        label: "Overview",
        href: `/workspace/organisation?organization=${entityId}`,
        matchPrefix: "/workspace/organisation",
        icon: "overview",
      },
      {
        label: "People",
        href: `/workspace/organisation/people?organization=${entityId}`,
        matchPrefix: "/workspace/organisation/people",
        icon: "people",
      },
    ];
  }
  if (type === "sangam" && entityId) {
    return [
      {
        label: "Overview",
        href: `/workspace/sangam?sangam=${entityId}`,
        matchPrefix: "/workspace/sangam",
        icon: "overview",
      },
      {
        label: "People",
        href: `/workspace/organisation/people?organization=${entityId}`,
        matchPrefix: "/workspace/organisation/people",
        icon: "people",
      },
    ];
  }
  return [];
}

export interface WorkspaceNavigationProps {
  readonly type: WorkspaceType | null;
  readonly entityId: string | null;
  readonly className?: string;
  readonly variant?: "tabs" | "sidebar" | "drawer";
  readonly collapsed?: boolean;
  readonly onNavigate?: () => void;
}

export function WorkspaceNavigation({
  type,
  entityId,
  className,
  variant = "tabs",
  collapsed = false,
  onNavigate,
}: WorkspaceNavigationProps) {
  const pathname = usePathname();
  const items = navItemsFor(type, entityId);
  if (items.length === 0) return null;

  const vertical = variant !== "tabs";

  return (
    <nav aria-label="Workspace navigation" className={className}>
      {vertical && !collapsed ? (
        <p
          className={`mb-2 px-3 text-[0.68rem] font-bold tracking-[0.16em] uppercase ${
            variant === "sidebar" ? "text-heritage-gold/80" : "text-slate"
          }`}
        >
          Workspace
        </p>
      ) : null}
      <ul className={vertical ? "grid gap-1" : "flex flex-wrap gap-1.5"}>
        {items.map((item) => {
          const current =
            item.matchPrefix === pathname ||
            (item.label !== "Overview" &&
              pathname.startsWith(item.matchPrefix));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={current ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
                className={workspaceLinkClassName(variant, current, collapsed)}
              >
                {vertical ? <WorkspaceNavIcon name={item.icon} /> : null}
                {collapsed ? null : item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function workspaceLinkClassName(
  variant: "tabs" | "sidebar" | "drawer",
  current: boolean,
  collapsed = false,
): string {
  if (variant === "sidebar") {
    return `focus-visible:ring-focus-inverse motion-control rounded-button relative flex min-h-11 items-center overflow-hidden text-sm font-semibold ${
      collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3"
    } ${
      current
        ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] before:bg-heritage-gold before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full"
        : "text-white/62 hover:bg-white/6 hover:text-white"
    }`;
  }
  if (variant === "drawer") {
    return `focus-visible:ring-focus motion-control rounded-button flex min-h-11 items-center gap-3 px-3 text-sm font-semibold ${
      current
        ? "bg-global-navy text-white"
        : "text-charcoal hover:bg-global-navy/6 hover:text-global-navy"
    }`;
  }
  return `focus-visible:ring-focus motion-control rounded-button inline-flex min-h-10 items-center px-3.5 text-sm font-semibold ${
    current
      ? "bg-global-navy text-white"
      : "text-global-navy hover:bg-global-navy/8"
  }`;
}

function WorkspaceNavIcon({ name }: { readonly name: "overview" | "people" }) {
  return name === "people" ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      className="size-5 shrink-0"
    >
      <circle cx="7" cy="6.5" r="2.5" strokeWidth="1.5" />
      <circle cx="14" cy="8" r="2" strokeWidth="1.5" />
      <path
        d="M2.8 16c.4-3 2-4.5 4.5-4.5s4.1 1.5 4.5 4.5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 12.2c2.7-.5 4.5.8 5 3.3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      className="size-5 shrink-0"
    >
      <rect x="3" y="3" width="5.5" height="5.5" rx="1" strokeWidth="1.5" />
      <rect x="11.5" y="3" width="5.5" height="5.5" rx="1" strokeWidth="1.5" />
      <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" strokeWidth="1.5" />
      <rect
        x="11.5"
        y="11.5"
        width="5.5"
        height="5.5"
        rx="1"
        strokeWidth="1.5"
      />
    </svg>
  );
}
