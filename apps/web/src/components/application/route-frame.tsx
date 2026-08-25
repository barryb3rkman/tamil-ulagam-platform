"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const applicationRoots = [
  "/admin",
  "/dashboard",
  "/dev",
  "/forgot-password",
  "/login",
  "/register",
  "/signup",
] as const;

function isApplicationPath(pathname: string): boolean {
  return applicationRoots.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

export function RouteFrame({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const isApplication = isApplicationPath(pathname);

  if (isApplication) {
    return (
      <div className="bg-warm-ivory flex min-h-screen flex-col">
        <main id="main-content" className="flex-1" tabIndex={-1}>
          <div data-route-transition="enter">{children}</div>
        </main>
        <footer className="border-global-navy/10 bg-deep-navy border-t py-5 text-white">
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
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div data-route-transition="enter">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
