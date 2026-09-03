"use client";

import { Sheet } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  groupWorkspaceOptions,
  switcherHasSomewhereToGo,
  type WorkspaceOption,
} from "@/features/workspace/workspace-options";

export interface WorkspaceSwitcherProps {
  readonly options: readonly WorkspaceOption[];
  readonly loading: boolean;
  readonly tone?: "dark" | "light";
  readonly block?: boolean;
}

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

export function WorkspaceSwitcher({
  options,
  loading,
  tone = "dark",
  block = false,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const side = useSheetSide();
  const grouped = groupWorkspaceOptions(options);
  const current = options.find((option) => option.current) ?? null;

  if (!loading && !switcherHasSomewhereToGo(options)) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Switch workspace"
        className={`rounded-button motion-control flex min-h-11 shrink-0 items-center gap-2 border px-3 py-1.5 text-sm font-semibold disabled:opacity-60 ${
          tone === "dark"
            ? `focus-visible:ring-focus-inverse hover:border-heritage-gold/45 border-white/10 bg-black/10 text-white/82 hover:bg-white/7 hover:text-white ${
                block ? "w-full justify-between" : ""
              }`
            : "border-global-navy/15 text-global-navy focus-visible:ring-focus hover:border-global-navy/35 bg-white"
        }`}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="text-sm">
            &#8645;
          </span>
          <span className={tone === "dark" ? "inline" : "hidden sm:inline"}>
            Switch workspace
          </span>
        </span>
        {tone === "dark" ? (
          <span aria-hidden="true" className="text-white/35">
            ›
          </span>
        ) : null}
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Your workspaces"
        side={side}
      >
        {current ? (
          <p className="text-charcoal mb-5 text-sm">
            You are currently managing{" "}
            <span className="text-global-navy font-semibold">
              {current.label}
            </span>
            .
          </p>
        ) : (
          <p className="text-charcoal mb-5 text-sm">
            Choose a workspace to open.
          </p>
        )}

        <nav aria-label="Available workspaces" className="grid gap-6">
          {grouped.member ? (
            <WorkspaceSwitcherSection
              heading="Member"
              options={[grouped.member]}
              onNavigate={() => setOpen(false)}
            />
          ) : null}
          {grouped.organisations.length > 0 ? (
            <WorkspaceSwitcherSection
              heading="Organisations"
              options={grouped.organisations}
              onNavigate={() => setOpen(false)}
            />
          ) : null}
          {grouped.sangams.length > 0 ? (
            <WorkspaceSwitcherSection
              heading="Tamil Sangams"
              options={grouped.sangams}
              onNavigate={() => setOpen(false)}
            />
          ) : null}
          {grouped.admin ? (
            <WorkspaceSwitcherSection
              heading="Federation"
              options={[grouped.admin]}
              onNavigate={() => setOpen(false)}
            />
          ) : null}
        </nav>
      </Sheet>
    </>
  );
}

function WorkspaceSwitcherSection({
  heading,
  options,
  onNavigate,
}: {
  readonly heading: string;
  readonly options: readonly WorkspaceOption[];
  readonly onNavigate: () => void;
}) {
  return (
    <div>
      <h3 className="text-slate mb-2 text-[0.68rem] font-bold tracking-[0.14em] uppercase">
        {heading}
      </h3>
      <ul className="grid gap-1.5">
        {options.map((option) => (
          <li key={`${option.type}-${option.id}`} className="min-w-0">
            <Link
              href={option.href}
              onClick={onNavigate}
              aria-current={option.current ? "page" : undefined}
              className={`focus-visible:ring-focus motion-control rounded-card flex min-h-11 items-center justify-between gap-3 border px-3.5 py-2.5 text-sm ${
                option.current
                  ? "border-heritage-gold bg-heritage-gold/10 text-global-navy font-bold"
                  : "border-global-navy/12 text-charcoal hover:border-global-navy/30 hover:bg-warm-ivory font-semibold"
              }`}
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {option.current ? (
                <span className="text-global-navy/60 shrink-0 text-xs font-bold tracking-[0.1em] uppercase">
                  Current
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
