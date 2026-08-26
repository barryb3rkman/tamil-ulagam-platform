"use client";

import { Sheet } from "@tamil-ulagam/ui";
import Link from "next/link";
import { useState } from "react";

import {
  groupWorkspaceOptions,
  type WorkspaceOption,
} from "@/features/workspace/workspace-options";

export interface WorkspaceSwitcherProps {
  readonly options: readonly WorkspaceOption[];
  readonly loading: boolean;
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
        className="focus-visible:ring-focus rounded-button motion-control flex min-h-11 items-center gap-2 border border-white/20 px-3 py-1.5 text-sm font-semibold text-white hover:border-white/45 disabled:opacity-60"
      >
        <span aria-hidden="true" className="text-xs">
          &#8645;
        </span>
        Switch workspace
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Your workspaces"
        side="right"
      >
        {current ? (
          <p className="text-slate mb-5 text-sm">
            You are currently managing{" "}
            <span className="text-global-navy font-semibold">
              {current.label}
            </span>
            .
          </p>
        ) : (
          <p className="text-slate mb-5 text-sm">Choose a workspace to open.</p>
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
          <li key={`${option.type}-${option.id}`}>
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
