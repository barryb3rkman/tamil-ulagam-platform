"use client";

import { Sheet } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  groupWorkspaceOptions,
  type WorkspaceOption,
} from "@/features/workspace/workspace-options";

export interface WorkspaceSwitcherProps {
  readonly options: readonly WorkspaceOption[];
  readonly loading: boolean;
}

/** Tailwind's `sm` breakpoint — the same width every other mobile/desktop
 * split in this shell (account label, divider, local-nav) already keys
 * off. Below it the switcher reads as Sheet's own documented mobile
 * treatment (an edge-anchored bottom sheet); at or above it, a right-side
 * drawer — Sheet supports both, but leaves the choice to the consumer. */
const DESKTOP_QUERY = "(min-width: 640px)";

function useSheetSide(): "bottom" | "right" {
  // Lazily read the real value at first render (client-only — static
  // export means this can also run where `window` never existed) rather
  // than setting it from an effect: the effect below exists purely to
  // subscribe to later changes, not to establish the initial value.
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
 * The deliberate workspace switcher (brief sections 4, 5, 23) — Member /
 * Organisations / Tamil Sangams / Federation, each section present only
 * when it has entries (brief section 29). Built on the existing `Sheet`
 * primitive: a native `<dialog>` gives focus trap, Escape-to-close and
 * focus return for free, so the accessibility work here is choosing real
 * semantics (a `<nav>` of links with `aria-current`) rather than a
 * clickable-div menu.
 */
export function WorkspaceSwitcher({
  options,
  loading,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const side = useSheetSide();
  const grouped = groupWorkspaceOptions(options);
  const current = options.find((option) => option.current) ?? null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Switch workspace"
        className="focus-visible:ring-focus-inverse rounded-button motion-control flex min-h-11 shrink-0 items-center gap-2 border border-white/20 px-3 py-1.5 text-sm font-semibold text-white hover:border-white/45 disabled:opacity-60"
      >
        {/* Icon-only below sm: on a narrow header the workspace identity
            needs the room far more than this label does — the aria-label
            above keeps the accessible name identical at every width. */}
        <span aria-hidden="true" className="text-sm">
          &#8645;
        </span>
        <span className="hidden sm:inline">Switch workspace</span>
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
      <h3 className="text-heritage-maroon mb-2 text-[0.68rem] font-bold tracking-[0.14em] uppercase">
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
                <span className="text-heritage-maroon shrink-0 text-xs font-bold tracking-[0.1em] uppercase">
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
