"use client";

import { Sheet } from "@tamil-ulagam/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { workspaceModules } from "@/content/workspace-modules";
import type { WorkspaceType } from "@/features/workspace/workspace-options";
import { moduleHref } from "@/features/workspace/module-routes";

import { ModuleIcon } from "./module-icons";

const DESKTOP_QUERY = "(min-width: 640px)";
const SIDEBAR_OPEN_STORAGE_KEY = "tu-programmes-expanded";

function useSheetSide(): "bottom" | "right" {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(DESKTOP_QUERY).matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return isDesktop ? "right" : "bottom";
}

export function ProgrammeNavigation({
  type,
  entityId,
  variant = "panel",
  onNavigate,
}: {
  readonly type: WorkspaceType | null;
  readonly entityId: string | null;
  readonly variant?: "panel" | "sidebar" | "drawer";
  readonly onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const side = useSheetSide();
  const pathname = usePathname();
  const isOnAModule = pathname.includes("/modules/");

  if (type === "admin" || type === null) return null;

  if (variant === "sidebar") {
    return (
      <SidebarProgrammes
        type={type}
        entityId={entityId}
        pathname={pathname}
        isOnAModule={isOnAModule}
      />
    );
  }

  if (variant === "drawer") {
    return (
      <nav aria-label="Tamil Ulagam programmes">
        <p className="text-slate text-eyebrow-sm mb-2 px-3">Programmes</p>
        <ProgrammeLinks
          type={type}
          entityId={entityId}
          pathname={pathname}
          variant={variant}
          onNavigate={onNavigate}
        />
      </nav>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-current={isOnAModule ? "page" : undefined}
        className={`focus-visible:ring-focus motion-control rounded-button inline-flex min-h-10 items-center gap-1.5 px-3.5 text-sm font-semibold ${
          isOnAModule
            ? "bg-global-navy text-white"
            : "text-global-navy hover:bg-global-navy/8"
        }`}
      >
        Programmes
        <span aria-hidden="true" className="text-xs">
          &#9662;
        </span>
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Tamil Ulagam programmes"
        side={side}
      >
        <p className="text-charcoal mb-5 text-sm leading-6">
          Tamil Ulagam&rsquo;s programme areas. Most are still in development —
          each has its own page with the current status.
        </p>
        <nav aria-label="Tamil Ulagam programmes">
          <ProgrammeLinks
            type={type}
            entityId={entityId}
            pathname={pathname}
            variant="panel"
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </Sheet>
    </>
  );
}

function SidebarProgrammes({
  entityId,
  isOnAModule,
  pathname,
  type,
}: {
  readonly type: Exclude<WorkspaceType, "admin">;
  readonly entityId: string | null;
  readonly pathname: string;
  readonly isOnAModule: boolean;
}) {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setExpanded((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Storage can be blocked; the toggle still works, it just won't stick.
      }
      return next;
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls="workspace-programmes-list"
        className={`focus-visible:ring-focus-inverse motion-control rounded-button text-eyebrow-sm flex min-h-9 w-full items-center justify-between px-3 ${
          isOnAModule ? "text-white" : "text-white/58 hover:text-white/80"
        }`}
      >
        <span>Programmes</span>
        <span className="flex items-center gap-1.5 text-white/70">
          {workspaceModules.length}
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path
              d="M2.5 4.5 6 8l3.5-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {expanded ? (
        <nav
          id="workspace-programmes-list"
          aria-label="Tamil Ulagam programmes"
          className="mt-1"
        >
          <ProgrammeLinks
            type={type}
            entityId={entityId}
            pathname={pathname}
            variant="sidebar"
          />
        </nav>
      ) : null}
    </div>
  );
}

function ProgrammeLinks({
  entityId,
  onNavigate,
  pathname,
  type,
  variant,
}: {
  readonly entityId: string | null;
  readonly onNavigate?: () => void;
  readonly pathname: string;
  readonly type: Exclude<WorkspaceType, "admin">;
  readonly variant: "panel" | "sidebar" | "drawer";
}) {
  return (
    <ul
      className={
        variant === "panel" ? "grid gap-1.5 sm:grid-cols-2" : "grid gap-0.5"
      }
    >
      {workspaceModules.map((workspaceModule) => {
        const href = moduleHref(type, entityId, workspaceModule.id);
        if (!href) return null;
        const current = pathname === href.split("?")[0];
        return (
          <li key={workspaceModule.id} className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={programmeLinkClassName(variant, current)}
            >
              <ModuleIcon
                moduleId={workspaceModule.id}
                className={`size-[1.1rem] shrink-0 ${
                  variant === "sidebar" && !current ? "text-white/70" : ""
                }`}
              />
              <span className="min-w-0 truncate">
                {workspaceModule.shortLabel}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function programmeLinkClassName(
  variant: "panel" | "sidebar" | "drawer",
  current: boolean,
): string {
  if (variant === "sidebar") {
    return `focus-visible:ring-focus-inverse motion-control rounded-button relative flex min-h-9 items-center gap-3 px-3 text-[0.82rem] font-medium ${
      current
        ? "bg-white/10 text-white before:bg-heritage-gold before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full"
        : "text-white/62 hover:bg-white/6 hover:text-white"
    }`;
  }
  if (variant === "drawer") {
    return `focus-visible:ring-focus motion-control rounded-button flex min-h-10 items-center gap-3 px-3 text-sm font-semibold ${
      current
        ? "bg-global-navy text-white"
        : "text-charcoal hover:bg-global-navy/6 hover:text-global-navy"
    }`;
  }
  return `focus-visible:ring-focus motion-control rounded-card flex min-h-11 items-center gap-2.5 border px-3.5 py-2.5 text-sm ${
    current
      ? "border-heritage-gold bg-heritage-gold/10 text-global-navy font-bold"
      : "border-global-navy/12 text-charcoal hover:border-global-navy/30 hover:bg-warm-ivory font-semibold"
  }`;
}
