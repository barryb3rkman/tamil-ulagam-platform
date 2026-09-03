"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";

import { useAdminOperations } from "@/features/admin/admin-operations-provider";
import { usePlatform } from "@/features/enrollment/platform-provider";
import { useWorkspaceInventory } from "@/features/workspace/use-workspace-inventory";
import {
  buildWorkspaceOptions,
  resolveActiveWorkspace,
} from "@/features/workspace/workspace-options";

import { WorkspaceSwitcher } from "../workspace/workspace-switcher";

interface AdminNavigationItem {
  readonly href: string;
  readonly label: string;
  readonly adminOnly?: boolean;
}

const adminNavigation: readonly AdminNavigationItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/organisations", label: "Organisations", adminOnly: true },
  { href: "/admin/sangams", label: "Tamil Sangams", adminOnly: true },
  { href: "/admin/memberships", label: "Memberships", adminOnly: true },
  { href: "/admin/partnerships", label: "Partnerships", adminOnly: true },
] as const;

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

export function AdminShell({ children }: { readonly children: ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { capabilities, error, loading } = useAdminOperations();
  const { currentUser, isHydrated, signOut } = usePlatform();
  const inventory = useWorkspaceInventory();
  const workspaceOptions = buildWorkspaceOptions({
    isAuthenticated: inventory.isAuthenticated,
    canReviewApplications: inventory.canReviewApplications,
    managedOrganisations: inventory.managedOrganisations,
    active: resolveActiveWorkspace(pathname, searchParams),
  });
  const canOperateFederation =
    mounted && isHydrated && capabilities.canOperateFederation;
  const navigation = adminNavigation.filter(
    (item) => !item.adminOnly || canOperateFederation,
  );
  const ready = mounted && isHydrated && !loading;
  const authorized =
    capabilities.canReviewRegistrations || capabilities.canOperateFederation;

  return (
    <div className="bg-warm-ivory min-h-[calc(100vh-4rem)]">
      <header className="bg-deep-navy border-heritage-gold/25 border-b text-white">
        <div className="mx-auto flex min-h-20 w-full max-w-[106rem] items-center justify-between gap-4 px-5 py-3 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/admin"
              aria-label="Federation Admin home"
              className="focus-visible:ring-focus-inverse flex min-w-0 items-center gap-3 rounded-sm"
            >
              <span
                aria-hidden="true"
                className="border-heritage-gold text-heritage-gold grid size-10 shrink-0 place-items-center rounded-full border text-sm font-bold"
              >
                TU
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-bold sm:text-base">
                  Tamil Ulagam
                </span>
                <span className="text-heritage-gold text-eyebrow-sm block truncate">
                  Federation Admin
                </span>
              </span>
            </Link>
            <span className="hidden h-8 w-px bg-white/15 lg:block" />
            <Link
              href="/"
              className="focus-visible:ring-focus-inverse hidden min-h-11 items-center text-sm font-semibold text-white/65 hover:text-white lg:inline-flex"
            >
              Public website
            </Link>
          </div>

          {mounted && isHydrated && currentUser ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <WorkspaceSwitcher
                options={workspaceOptions}
                loading={inventory.state === "loading"}
              />
              <Link
                href="/dashboard/account"
                className="focus-visible:ring-focus-inverse group hidden min-h-11 items-center gap-2 rounded-sm px-1.5 sm:flex"
              >
                <span
                  aria-hidden="true"
                  className="bg-heritage-gold text-deep-navy grid size-9 place-items-center rounded-full text-xs font-bold"
                >
                  {initials(currentUser.fullName)}
                </span>
                <span className="hidden text-left xl:block">
                  <span className="block max-w-36 truncate text-sm font-semibold">
                    {currentUser.fullName}
                  </span>
                  <span className="block text-xs text-white/55">Account</span>
                </span>
              </Link>
              <button
                type="button"
                className="focus-visible:ring-focus-inverse hover:border-heritage-gold hover:text-heritage-gold rounded-button min-h-11 border border-white/20 px-3 py-2 text-sm font-semibold"
                onClick={() => {
                  void signOut().then(() => router.push("/login"));
                }}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[106rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav
          aria-label="Admin navigation"
          className="border-global-navy/10 border-b bg-white/70 px-5 py-3 sm:px-7 lg:min-h-[calc(100vh-9rem)] lg:border-r lg:border-b-0 lg:bg-white/45 lg:px-5 lg:py-8"
        >
          <p className="text-slate text-eyebrow-sm mb-4 hidden px-3 lg:block">
            Federation operations
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {navigation.map((item) => {
              const current =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`focus-visible:ring-focus rounded-button flex min-h-11 items-center justify-center px-3 py-2 text-center text-sm font-semibold lg:justify-start lg:px-4 lg:text-left ${
                      current
                        ? "bg-global-navy text-white shadow-sm"
                        : "text-global-navy hover:bg-global-navy/6"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mr-3 hidden size-1.5 rounded-full lg:block ${current ? "bg-heritage-gold" : "bg-global-navy/25"}`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 px-5 py-7 sm:px-7 sm:py-9 lg:px-9 lg:py-8 xl:px-12">
          {!ready ? (
            <AdminShellLoading />
          ) : error ? (
            <AdminShellMessage
              title="Admin workspace unavailable"
              message={error}
            />
          ) : !authorized ? (
            <AdminShellMessage
              title="Federation access required"
              message="This account does not have a Federation administrator or registration reviewer role."
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

function AdminShellLoading() {
  return (
    <div
      role="status"
      className="grid gap-3 py-8"
      aria-label="Loading Admin workspace"
    >
      <div className="bg-global-navy/8 h-4 w-36 animate-pulse rounded" />
      <div className="bg-global-navy/8 h-10 max-w-md animate-pulse rounded" />
      <p className="text-slate mt-2">Checking Federation access…</p>
    </div>
  );
}

function AdminShellMessage({
  title,
  message,
}: {
  readonly title: string;
  readonly message: string;
}) {
  return (
    <section className="border-global-navy/12 rounded-card shadow-card border bg-white p-7 sm:p-9">
      <p className="text-slate text-eyebrow-sm">Restricted workspace</p>
      <h1 className="text-section-title text-gradient-ink mt-2">{title}</h1>
      <p className="text-slate mt-3 max-w-xl leading-7">{message}</p>
      <Link
        href="/workspace/member"
        className="text-global-navy focus-visible:ring-focus mt-5 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
      >
        Return to your member workspace
      </Link>
    </section>
  );
}
