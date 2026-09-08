"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AmbientField } from "@/components/motion/ambient-field";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* Two independent questions, which used to share one answer.

   Chrome: does this route get the public header and footer, or the bare
   portal frame? Signing in and registering are portal work.

   Theme: does it stand on the night field, or on the portal's own light
   surface? Everything the public meets is night — the marketing pages, the
   way in, and the registration journey, which is reached from both and must
   not change colour depending on which door was used. The workspace and the
   admin console are tools rather than a shopfront: dense tables and long
   forms people sit with for an hour, and they keep the light surface. */
const portalRoots = [
  "/admin",
  "/dashboard",
  "/dev",
  "/forgot-password",
  "/login",
  "/register",
  "/signup",
  "/workspace",
] as const;

const daylightRoots = ["/admin", "/dashboard", "/dev", "/workspace"] as const;

function isUnder(pathname: string, roots: readonly string[]): boolean {
  return roots.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

export function RouteFrame({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const isPortal = isUnder(pathname, portalRoots);
  const isNight = !isUnder(pathname, daylightRoots);
  const isPremiumWorkspace =
    pathname === "/dashboard" ||
    pathname === "/dashboard/" ||
    pathname === "/dashboard/account" ||
    pathname === "/dashboard/account/" ||
    pathname === "/workspace" ||
    pathname.startsWith("/workspace/");

  if (isPortal) {
    return (
      <div
        data-theme={isNight ? "night" : undefined}
        className={
          isNight
            ? "flex min-h-screen flex-col"
            : "bg-sunken flex min-h-screen flex-col"
        }
      >
        {isNight ? <NightField /> : <AmbientField />}
        <main id="main-content" className="flex-1" tabIndex={-1}>
          <div data-route-transition="enter">{children}</div>
        </main>
        {isPremiumWorkspace ? null : <PortalFooter />}
      </div>
    );
  }

  return (
    <div data-theme="night" className="flex min-h-screen flex-col">
      <NightField />
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div data-route-transition="enter">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

/* One continuous field behind the whole document, painted once on a fixed
   layer. Nothing above it carries a fill, which is what keeps it seamless
   rather than a run of coloured blocks. */
function NightField() {
  return (
    <>
      <div aria-hidden="true" className="night-field" />
      <div aria-hidden="true" className="night-veil" />
      <div aria-hidden="true" className="night-grain" />
    </>
  );
}

function PortalFooter() {
  return (
    <footer className="portal-footer border-hairline border-t py-5 text-white">
      <div className="mx-auto flex w-full max-w-[106rem] flex-col gap-3 px-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
        <p className="font-semibold">Tamil Ulagam Global Federation</p>
        <nav aria-label="Portal legal navigation">
          <ul className="flex gap-5 text-white/70">
            <li>
              <Link
                href="/privacy"
                className="focus-visible:ring-focus hover:text-heritage-gold underline-offset-4 hover:underline"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="focus-visible:ring-focus hover:text-heritage-gold underline-offset-4 hover:underline"
              >
                Terms
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
