"use client";

import { Sheet } from "@tamil-ulagam/ui";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { usePlatform } from "@/features/enrollment/platform-provider";
import { useWorkspaceInventory } from "@/features/workspace/use-workspace-inventory";
import {
  buildWorkspaceOptions,
  findCurrentWorkspace,
  resolveActiveWorkspace,
  visibleSwitcherOptions,
} from "@/features/workspace/workspace-options";

import { BrandMark } from "@/components/brand/brand-mark";

import { ProgrammeNavigation } from "./programme-navigation";
import { WorkspaceIdentity, workspaceTypeLabel } from "./workspace-identity";
import { WorkspaceNavigation } from "./workspace-navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";

const SIDEBAR_COLLAPSED_KEY = "tu-sidebar-collapsed";

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

export function WorkspaceShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const {
    currentUser,
    isHydrated,
    myOrganisationApplications = [],
    signOut,
  } = usePlatform();
  const inventory = useWorkspaceInventory();

  const active = resolveActiveWorkspace(pathname, searchParams);
  const managedOrganisations = inventory.serviceAvailable
    ? inventory.managedOrganisations
    : myOrganisationApplications.map(({ organisation, registration }) => ({
        id: organisation.id,
        name: organisation.name,
        category: organisation.category,
        subtype:
          registration.categoryProfile &&
          "subtype" in registration.categoryProfile
            ? registration.categoryProfile.subtype
            : "",
        city: organisation.city,
        region: organisation.region,
        country: organisation.country,
      }));
  const options = buildWorkspaceOptions({
    isAuthenticated: inventory.isAuthenticated,
    canReviewApplications: inventory.canReviewApplications,
    managedOrganisations,
    active,
  });
  const current = findCurrentWorkspace(options);
  const switcherOptions = visibleSwitcherOptions(options);
  const chromeLoading = !isHydrated || inventory.state === "loading";
  const pageLabel = workspacePageLabel(pathname);

  const signOutAndReturn = () => {
    void signOut().then(() => router.push("/login"));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // Storage can be blocked; the toggle still works, it just won't stick.
      }
      return next;
    });
  };

  return (
    <div
      className={`surface-page relative min-h-[100dvh] lg:grid ${
        sidebarCollapsed
          ? "lg:grid-cols-[5rem_minmax(0,1fr)]"
          : "lg:grid-cols-[18.5rem_minmax(0,1fr)]"
      }`}
    >
      <aside className="bg-deep-navy border-heritage-gold/20 sticky top-0 z-40 hidden h-[100dvh] min-h-[44rem] flex-col overflow-hidden border-r text-white shadow-[1.25rem_0_4rem_rgba(6,29,50,0.08)] lg:flex">
        <WorkspaceBrand collapsed={sidebarCollapsed} />
        {!sidebarCollapsed ? (
          <div className="px-3">
            {isHydrated && currentUser ? (
              <WorkspaceSwitcher
                options={switcherOptions}
                loading={chromeLoading}
              />
            ) : (
              <p className="text-sm font-semibold text-white/70">
                Tamil Ulagam Workspace
              </p>
            )}
          </div>
        ) : null}

        {isHydrated && currentUser && !chromeLoading ? (
          <div className="premium-sidebar-scroll mt-4 flex-1 overflow-y-auto px-3 pb-5">
            <WorkspaceNavigation
              type={active.type}
              entityId={active.id}
              variant="sidebar"
              collapsed={sidebarCollapsed}
            />
            {!sidebarCollapsed ? (
              <>
                <div className="my-4 h-px bg-white/10" />
                <ProgrammeNavigation
                  type={active.type}
                  entityId={active.id}
                  variant="sidebar"
                />
              </>
            ) : null}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="focus-visible:ring-focus-inverse motion-control text-eyebrow-sm mx-3 mb-2 flex min-h-9 items-center gap-2 rounded-lg px-3 text-white/40 hover:bg-white/6 hover:text-white/70 focus-visible:outline-none"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            className={`size-4 shrink-0 transition-transform duration-300 ${
              sidebarCollapsed ? "" : "rotate-180"
            }`}
          >
            <path
              d="M6 3.5 10.5 8 6 12.5"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!sidebarCollapsed ? <span>Collapse</span> : null}
        </button>

        {isHydrated && currentUser ? (
          <div
            className={`border-t border-white/10 bg-black/5 ${
              sidebarCollapsed ? "px-2 py-4" : "p-4"
            }`}
          >
            <Link
              href="/dashboard/account"
              title={sidebarCollapsed ? currentUser.fullName : undefined}
              aria-label={
                sidebarCollapsed
                  ? `Account settings for ${currentUser.fullName}`
                  : undefined
              }
              className={`focus-visible:ring-focus-inverse rounded-button group flex min-h-12 items-center gap-3 py-1.5 hover:bg-white/7 ${
                sidebarCollapsed ? "justify-center px-0" : "px-2"
              }`}
            >
              <span
                aria-hidden="true"
                className="bg-heritage-gold text-deep-navy grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold"
              >
                {initials(currentUser.fullName)}
              </span>
              {!sidebarCollapsed ? (
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-sm font-semibold">
                    {currentUser.fullName}
                  </span>
                  <span className="block text-xs text-white/50">
                    Account settings
                  </span>
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={signOutAndReturn}
              aria-label={sidebarCollapsed ? "Sign out" : undefined}
              className={`focus-visible:ring-focus-inverse rounded-button mt-1 flex min-h-10 w-full items-center text-sm font-semibold text-white/55 hover:bg-white/7 hover:text-white ${
                sidebarCollapsed ? "justify-center px-0" : "px-3"
              }`}
            >
              {sidebarCollapsed ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  className="size-[1.15rem]"
                >
                  <path
                    d="M12.5 6.5V4.8a1.3 1.3 0 0 0-1.3-1.3H5.3A1.3 1.3 0 0 0 4 4.8v10.4a1.3 1.3 0 0 0 1.3 1.3h5.9a1.3 1.3 0 0 0 1.3-1.3v-1.7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8.6 10h8m0 0-2.4-2.4M16.6 10l-2.4 2.4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                "Sign out"
              )}
            </button>
            {!sidebarCollapsed ? (
              <nav
                aria-label="Workspace legal navigation"
                className="mt-2 px-3"
              >
                <ul className="flex gap-4 text-[0.7rem] font-medium text-white/58">
                  <li>
                    <Link
                      href="/privacy"
                      className="focus-visible:ring-focus-inverse rounded-sm hover:text-white/70"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="focus-visible:ring-focus-inverse rounded-sm hover:text-white/70"
                    >
                      Terms
                    </Link>
                  </li>
                </ul>
              </nav>
            ) : null}
          </div>
        ) : null}
      </aside>

      <div className="relative min-w-0 overflow-hidden">
        <header className="border-global-navy/10 bg-warm-ivory/95 sticky top-0 z-30 border-b backdrop-blur-xl">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4 px-5 sm:px-7 lg:px-8 xl:px-10">
            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileNavigationOpen(true)}
                aria-label="Open workspace navigation"
                aria-haspopup="dialog"
                aria-expanded={mobileNavigationOpen}
                className="border-global-navy/15 focus-visible:ring-focus rounded-button grid size-11 shrink-0 place-items-center border bg-white"
              >
                <span aria-hidden="true" className="grid gap-1">
                  <span className="bg-global-navy block h-0.5 w-5" />
                  <span className="bg-global-navy block h-0.5 w-5" />
                  <span className="bg-global-navy block h-0.5 w-5" />
                </span>
              </button>
              <Link
                href="/"
                aria-label="Tamil Ulagam home"
                className="focus-visible:ring-focus shrink-0 rounded-full"
              >
                <BrandMark className="size-9" />
              </Link>
            </div>
            <div
              role="group"
              aria-label="Current workspace"
              className="hidden min-w-0 lg:block"
            >
              <p className="text-slate text-eyebrow-sm">
                Tamil Ulagam
                <span aria-hidden="true" className="text-global-navy/25 mx-1.5">
                  ·
                </span>
                <span>{workspaceTypeLabel(current?.type ?? active.type)}</span>
              </p>
              <p className="mt-0.5 flex min-w-0 items-center text-sm font-bold">
                <span className="text-global-navy truncate">
                  {current?.label ?? "Workspace"}
                </span>
                <span
                  aria-hidden="true"
                  className="text-global-navy/25 mx-2 shrink-0"
                >
                  /
                </span>
                <span className="text-slate shrink-0 font-semibold">
                  {pageLabel}
                </span>
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {isHydrated && currentUser ? (
                <>
                  <div className="lg:hidden">
                    <WorkspaceSwitcher
                      options={switcherOptions}
                      loading={chromeLoading}
                      tone="light"
                    />
                  </div>
                  <Link
                    href="/dashboard/account"
                    aria-label={`Account settings for ${currentUser.fullName}`}
                    className="focus-visible:ring-focus rounded-full"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-global-navy text-warm-ivory grid size-9 place-items-center rounded-full text-xs font-bold"
                    >
                      {initials(currentUser.fullName)}
                    </span>
                  </Link>
                </>
              ) : isHydrated ? (
                <Link
                  href="/login"
                  className="bg-global-navy focus-visible:ring-focus rounded-button inline-flex min-h-10 items-center px-4 text-sm font-semibold text-white"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {isHydrated ? (
          <div className="relative">{children}</div>
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

      <Sheet
        open={mobileNavigationOpen}
        onClose={() => setMobileNavigationOpen(false)}
        title="Workspace navigation"
        side="right"
      >
        {isHydrated && currentUser ? (
          <>
            <div className="bg-deep-navy rounded-card p-4 text-white">
              <div role="group" aria-label="Current workspace">
                <WorkspaceIdentity
                  loading={chromeLoading}
                  current={current}
                  fallbackType={active.type}
                  fallbackId={active.id}
                />
              </div>
            </div>
            {!chromeLoading ? (
              <div className="mt-5">
                <WorkspaceNavigation
                  type={active.type}
                  entityId={active.id}
                  variant="drawer"
                  onNavigate={() => setMobileNavigationOpen(false)}
                />
                <div className="border-global-navy/10 my-5 border-t" />
                <ProgrammeNavigation
                  type={active.type}
                  entityId={active.id}
                  variant="drawer"
                  onNavigate={() => setMobileNavigationOpen(false)}
                />
              </div>
            ) : null}
            <div className="border-global-navy/10 mt-6 grid gap-1 border-t pt-5">
              <Link
                href="/dashboard/account"
                onClick={() => setMobileNavigationOpen(false)}
                className="text-global-navy focus-visible:ring-focus rounded-button flex min-h-11 items-center px-3 text-sm font-semibold"
              >
                Account settings
              </Link>
              <button
                type="button"
                onClick={signOutAndReturn}
                className="text-slate focus-visible:ring-focus rounded-button flex min-h-11 items-center px-3 text-sm font-semibold"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <Link href="/login" className="text-global-navy font-semibold">
            Sign in
          </Link>
        )}
      </Sheet>
    </div>
  );
}

function WorkspaceBrand({
  collapsed = false,
}: {
  readonly collapsed?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`focus-visible:ring-focus-inverse group flex min-h-[5.75rem] items-center gap-3 ${
        collapsed ? "justify-center px-0" : "px-5"
      }`}
      aria-label="Tamil Ulagam home"
    >
      <BrandMark className="size-11 shrink-0 transition-transform duration-500 group-hover:scale-105" />
      {!collapsed ? (
        <span className="leading-tight">
          <span className="block text-[0.95rem] font-bold tracking-[-0.01em]">
            Tamil Ulagam
          </span>
          <span className="text-heritage-gold/75 text-eyebrow-sm mt-1 block">
            Global Federation
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function workspacePageLabel(pathname: string): string {
  if (pathname.startsWith("/dashboard/account")) return "Account settings";
  if (pathname.includes("/people")) return "People";
  if (pathname.includes("/modules/")) return "Programme preview";
  return "Overview";
}
