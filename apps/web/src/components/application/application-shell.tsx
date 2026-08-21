"use client";

import { ImageWithFallback } from "@tamil-ulagam/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { images } from "@/config/images";
import { usePlatform } from "@/features/enrollment/platform-provider";

const memberNavigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/registration", label: "Registration" },
  { href: "/dashboard/account", label: "Account" },
] as const;

const adminNavigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/registrations", label: "Registration queue" },
] as const;

export function ApplicationShell({
  children,
  area,
}: {
  readonly children: ReactNode;
  readonly area: "member" | "admin";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    availableOrganisations,
    canReviewApplications,
    currentApplication,
    currentUser,
    isHydrated,
    platformError,
    selectOrganisation,
    signOut,
  } = usePlatform();
  const navigation = area === "admin" ? adminNavigation : memberNavigation;
  const areaLabel = area === "admin" ? "Administration" : "Organisation Portal";

  return (
    <div className="bg-warm-ivory min-h-[calc(100vh-4rem)]">
      <header className="bg-deep-navy border-heritage-gold/25 relative z-20 border-b text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.12]"
        >
          <ImageWithFallback
            asset={images.portalBackgroundMotif}
            className="h-full w-full object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="relative mx-auto flex min-h-20 w-full max-w-[106rem] items-center justify-between gap-4 px-5 py-3 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href={area === "admin" ? "/admin" : "/dashboard"}
              className="focus-visible:ring-focus group flex min-w-0 items-center gap-3 rounded-sm"
              aria-label={`${areaLabel} home`}
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
                <span className="text-heritage-gold block text-[0.68rem] font-bold tracking-[0.12em] uppercase sm:hidden">
                  {area === "admin" ? "Administration" : "Portal"}
                </span>
                <span className="text-heritage-gold hidden truncate text-xs font-bold tracking-[0.12em] uppercase sm:block">
                  {areaLabel}
                </span>
              </span>
            </Link>
            <span className="hidden h-8 w-px bg-white/15 lg:block" />
            <Link
              href="/"
              className="focus-visible:ring-focus hidden min-h-11 items-center text-sm font-semibold text-white/65 hover:text-white lg:inline-flex"
            >
              Back to website
            </Link>
          </div>

          {area === "member" && currentUser ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard/account"
                className="focus-visible:ring-focus group rounded-button flex min-h-11 items-center gap-2 px-1.5 sm:px-2"
              >
                <span
                  aria-hidden="true"
                  className="bg-heritage-gold text-deep-navy grid size-9 place-items-center rounded-full text-xs font-bold"
                >
                  {initials(currentUser.fullName)}
                </span>
                <span className="hidden text-left sm:block">
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
                className="focus-visible:ring-focus hover:border-heritage-gold hover:text-heritage-gold rounded-button min-h-11 border border-white/20 px-3 py-2 text-sm font-semibold transition-colors sm:px-4"
                onClick={() => {
                  void signOut().then(() => router.push("/login"));
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              {area === "admin" ? (
                <Link
                  href="/dashboard"
                  className="focus-visible:ring-focus hidden min-h-11 items-center px-3 text-sm font-semibold text-white/65 hover:text-white sm:inline-flex"
                >
                  Member portal
                </Link>
              ) : null}
              <Link
                href="/"
                className="focus-visible:ring-focus rounded-button inline-flex min-h-11 items-center border border-white/20 px-3 text-sm font-semibold hover:border-white/45 sm:hidden"
              >
                Website
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[106rem] lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <nav
          aria-label={
            area === "admin" ? "Admin navigation" : "Account navigation"
          }
          className="border-global-navy/10 border-b bg-white/65 px-5 py-3 sm:px-7 lg:min-h-[calc(100vh-9rem)] lg:border-r lg:border-b-0 lg:bg-white/40 lg:px-5 lg:py-9"
        >
          <p className="text-slate mb-4 hidden px-3 text-[0.68rem] font-bold tracking-[0.14em] uppercase lg:block">
            {area === "admin" ? "Review workspace" : "Your workspace"}
          </p>
          {area === "member" && availableOrganisations.length > 1 ? (
            <label className="mb-4 grid gap-1.5 px-1 text-xs font-semibold">
              <span className="text-slate">Current organisation</span>
              <select
                value={currentApplication?.organisation.id ?? ""}
                onChange={(event) => {
                  void selectOrganisation(event.target.value);
                }}
                className="border-global-navy/20 text-global-navy focus-visible:ring-focus rounded-button min-h-11 min-w-0 border bg-white px-3 text-sm"
              >
                {availableOrganisations.map((organisation) => (
                  <option key={organisation.id} value={organisation.id}>
                    {organisation.name || "Incomplete organisation"}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <ul
            className={`grid gap-2 ${area === "admin" ? "grid-cols-2" : "grid-cols-3"} lg:grid-cols-1`}
          >
            {navigation.map((item) => {
              const registrationRoute =
                item.href === "/dashboard/registration" &&
                pathname.startsWith("/register");
              const current =
                registrationRoute ||
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/admin" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`motion-control focus-visible:ring-focus rounded-button relative flex min-h-11 items-center justify-center px-3 py-2 text-center text-sm font-semibold lg:justify-start lg:px-4 lg:text-left ${current ? "bg-global-navy text-white shadow-sm" : "text-global-navy hover:bg-global-navy/6"}`}
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
        <div
          className={`min-w-0 px-5 py-7 sm:px-7 sm:py-9 lg:px-9 xl:px-12 ${area === "admin" ? "lg:py-8" : "lg:py-10"}`}
        >
          {platformError ? (
            <div
              role="alert"
              className="border-error/25 bg-error/5 text-error rounded-card mb-6 border p-4 leading-6"
            >
              {platformError}
            </div>
          ) : null}
          {area === "admin" && isHydrated && !canReviewApplications ? (
            <section className="border-global-navy/12 rounded-card shadow-card border bg-white p-7 sm:p-9">
              <p className="text-heritage-maroon text-xs font-bold tracking-[0.14em] uppercase">
                Restricted workspace
              </p>
              <h1 className="text-global-navy mt-3 text-3xl font-bold">
                Review access required
              </h1>
              <p className="text-slate mt-3 max-w-xl leading-7">
                This account does not have an administrator or reviewer role.
                Review access is enforced by the enrollment service.
              </p>
              <Link
                href="/dashboard"
                className="text-global-navy focus-visible:ring-focus mt-5 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                Return to your dashboard
              </Link>
            </section>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
