"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useWorkspaceInventory } from "@/features/workspace/use-workspace-inventory";
import {
  buildWorkspaceOptions,
  findCurrentWorkspace,
  resolveActiveWorkspace,
} from "@/features/workspace/workspace-options";

import { WorkspaceIdentity } from "./workspace-identity";
import { WorkspaceNavigation } from "./workspace-navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";

function initials(fullName: string): string {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

/**
 * The V3 signed-in shell for every `/workspace/*` route (brief section
 * 9) — the chrome those routes currently entirely lack (`RouteFrame`
 * gives them only a bare footer wrapper). Provides Tamil Ulagam
 * identity, current workspace identity, the workspace switcher, purpose-
 * specific local navigation, and account/sign-out access, all built from
 * the same real data the switcher itself uses (no separate "is this
 * organisation a Sangam" logic duplicated here).
 *
 * `/admin` and `/dashboard` deliberately keep their existing
 * `ApplicationShell` chrome (brief: do not redesign Admin; `/dashboard`
 * is a compatibility surface, not a fourth shell to build) — this
 * component owns member/organisation/Sangam workspace chrome only.
 */
export function WorkspaceShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, isHydrated, signOut } = usePlatform();
  const inventory = useWorkspaceInventory();

  const active = resolveActiveWorkspace(pathname, searchParams);
  const options = buildWorkspaceOptions({
    isAuthenticated: inventory.isAuthenticated,
    canReviewApplications: inventory.canReviewApplications,
    managedOrganisations: inventory.managedOrganisations,
    active,
  });
  const current = findCurrentWorkspace(options);
  const chromeLoading = !isHydrated || inventory.state === "loading";

  return (
    <div className="bg-warm-ivory min-h-[calc(100vh-4rem)]">
      <header className="bg-deep-navy border-heritage-gold/25 relative z-20 border-b text-white">
        <div className="relative mx-auto flex min-h-20 w-full max-w-[106rem] items-center justify-between gap-4 px-5 py-3 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="focus-visible:ring-focus-inverse group flex min-w-0 shrink-0 items-center gap-3 rounded-sm"
              aria-label="Tamil Ulagam home"
            >
              <span
                aria-hidden="true"
                className="border-heritage-gold text-heritage-gold grid size-10 shrink-0 place-items-center rounded-full border text-sm font-bold"
              >
                TU
              </span>
            </Link>
            <span className="hidden h-8 w-px bg-white/15 sm:block" />
            {isHydrated && currentUser ? (
              <div
                role="group"
                aria-label="Current workspace"
                className="min-w-0"
              >
                <WorkspaceIdentity
                  loading={chromeLoading}
                  current={current}
                  fallbackType={active.type}
                  fallbackId={active.id}
                />
              </div>
            ) : (
              <span className="text-sm font-semibold text-white/70">
                Tamil Ulagam Workspace
              </span>
            )}
          </div>

          {isHydrated && currentUser ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <WorkspaceSwitcher options={options} loading={chromeLoading} />
              <Link
                href="/dashboard/account"
                className="focus-visible:ring-focus-inverse group rounded-button hidden min-h-11 items-center gap-2 px-1.5 sm:flex sm:px-2"
              >
                <span
                  aria-hidden="true"
                  className="bg-heritage-gold text-deep-navy grid size-9 place-items-center rounded-full text-xs font-bold"
                >
                  {initials(currentUser.fullName)}
                </span>
                <span className="hidden text-left lg:block">
                  <span className="block max-w-36 truncate text-sm font-semibold">
                    {currentUser.fullName}
                  </span>
                  <span className="block text-xs text-white/55 group-hover:text-white/75">
                    Account
                  </span>
                </span>
              </Link>
              <button
                type="button"
                className="focus-visible:ring-focus-inverse hover:border-heritage-gold hover:text-heritage-gold rounded-button min-h-11 border border-white/20 px-3 py-2 text-sm font-semibold transition-colors sm:px-4"
                onClick={() => {
                  void signOut().then(() => router.push("/login"));
                }}
              >
                Sign out
              </button>
            </div>
          ) : isHydrated ? (
            <Link
              href="/login"
              className="focus-visible:ring-focus-inverse rounded-button inline-flex min-h-11 items-center border border-white/20 px-3 text-sm font-semibold hover:border-white/45"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </header>

      {isHydrated && currentUser && !chromeLoading ? (
        <div className="border-global-navy/10 bg-white/65 px-5 py-2.5 sm:px-7 lg:px-10">
          <div className="mx-auto w-full max-w-[106rem]">
            <WorkspaceNavigation type={active.type} entityId={active.id} />
          </div>
        </div>
      ) : null}

      {isHydrated ? (
        <div data-motion-reveal>{children}</div>
      ) : (
        <div
          role="status"
          aria-label="Loading workspace"
          className="py-16 sm:py-20"
        >
          <span className="sr-only">Loading your workspace…</span>
        </div>
      )}
    </div>
  );
}
