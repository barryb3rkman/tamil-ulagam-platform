"use client";

import type { NavigationEntry } from "@tamil-ulagam/shared";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface PrimaryNavigationProps {
  readonly entries: readonly NavigationEntry[];
}

export function PrimaryNavigation({ entries }: PrimaryNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-2 lg:flex lg:justify-self-end xl:justify-self-center"
    >
      {entries.map((entry) => {
        const isCurrent =
          pathname === entry.href ||
          (entry.href === "/initiatives" &&
            pathname.startsWith("/initiatives/"));

        return (
          <Link
            key={entry.href}
            aria-current={isCurrent ? "page" : undefined}
            className={`rounded-button focus-visible:ring-focus px-3.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none ${
              isCurrent
                ? "bg-global-navy text-white"
                : "text-global-navy hover:bg-global-navy/5 hover:text-heritage-maroon"
            }`}
            href={entry.href}
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
