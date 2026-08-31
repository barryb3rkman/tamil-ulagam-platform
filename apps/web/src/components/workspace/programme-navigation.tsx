"use client";

import { Sheet } from "@tamil-ulagam/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { workspaceModules } from "@/content/workspace-modules";
import type { WorkspaceType } from "@/features/workspace/workspace-options";
import { moduleHref } from "@/features/workspace/module-routes";

import { moduleAccentClassName } from "./module-accent";

const DESKTOP_QUERY = "(min-width: 640px)";

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

/**
 * The distinct, grouped entry point into Tamil Ulagam's 11 future
 * programme modules (H6 brief sections 6-7) — deliberately separate
 * from `WorkspaceNavigation`'s operational tabs (Overview/People), never
 * mixed into that same flat tab row, so the product keeps a clear
 * hierarchy between "manage this workspace" and "explore Tamil Ulagam."
 * Built on the same `Sheet` primitive `WorkspaceSwitcher` already uses —
 * proven accessible (focus trap, Escape-to-close), and its responsive
 * bottom-sheet/side-drawer split keeps 11 items from becoming a crowded
 * desktop dropdown or an endless mobile menu dump.
 */
export function ProgrammeNavigation({
  type,
  entityId,
}: {
  readonly type: WorkspaceType | null;
  readonly entityId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const side = useSheetSide();
  const pathname = usePathname();
  const isOnAModule = pathname.includes("/modules/");

  if (type === "admin" || type === null) return null;

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
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {workspaceModules.map((workspaceModule) => {
              const href = moduleHref(type, entityId, workspaceModule.id);
              if (!href) return null;
              const current = pathname === href.split("?")[0];
              return (
                <li key={workspaceModule.id} className="min-w-0">
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={current ? "page" : undefined}
                    className={`focus-visible:ring-focus motion-control rounded-card flex min-h-11 items-center gap-2.5 border px-3.5 py-2.5 text-sm ${
                      current
                        ? "border-heritage-gold bg-heritage-gold/10 text-global-navy font-bold"
                        : "border-global-navy/12 text-charcoal hover:border-global-navy/30 hover:bg-warm-ivory font-semibold"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-2 shrink-0 rounded-full ${moduleAccentClassName(workspaceModule.accent)}`}
                    />
                    <span className="min-w-0 truncate">
                      {workspaceModule.shortLabel}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Sheet>
    </>
  );
}
