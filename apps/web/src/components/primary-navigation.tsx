"use client";

import {
  isNavigationPathCurrent,
  type NavigationEntry,
} from "@tamil-ulagam/shared";
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
      className="hidden items-center gap-1 min-[85rem]:flex min-[85rem]:justify-self-center min-[100rem]:gap-2"
    >
      {entries.map((entry) => {
        const isCurrent = isNavigationPathCurrent(pathname, entry.href);

        return (
          <Link
            key={entry.href}
            aria-current={isCurrent ? "page" : undefined}
            className="nav-link focus-visible:ring-focus focus-visible:outline-none"
            href={entry.href}
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
