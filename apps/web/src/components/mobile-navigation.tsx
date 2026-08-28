"use client";

import {
  isNavigationPathCurrent,
  type NavigationEntry,
  type UserProfile,
} from "@tamil-ulagam/shared";
import { VisuallyHidden } from "@tamil-ulagam/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface MobileNavigationProps {
  readonly entries: readonly NavigationEntry[];
  readonly isHydrated?: boolean;
  readonly signedIn?: boolean;
  readonly currentUser?: UserProfile | null;
}

export function MobileNavigation({
  currentUser,
  entries,
  isHydrated = false,
  signedIn = false,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    setIsMounted(true);
    window.requestAnimationFrame(() => setIsOpen(true));
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="min-[85rem]:hidden">
      <button
        ref={toggleButtonRef}
        type="button"
        aria-controls="mobile-navigation-panel"
        aria-expanded={isOpen}
        data-state={isOpen ? "open" : "closed"}
        className="motion-control rounded-button border-global-navy/20 text-global-navy hover:bg-global-navy/5 focus-visible:ring-focus grid size-11 place-items-center border focus-visible:outline-none"
        onClick={() => {
          if (isOpen) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
      >
        <VisuallyHidden>{isOpen ? "Close menu" : "Open menu"}</VisuallyHidden>
        <span aria-hidden="true" className="motion-menu-icon grid gap-1.5">
          <span className="motion-menu-line block h-0.5 w-5 rounded-full bg-current" />
          <span className="motion-menu-line block h-0.5 w-5 rounded-full bg-current" />
          <span className="motion-menu-line block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      {isMounted ? (
        <div
          id="mobile-navigation-panel"
          data-state={isOpen ? "open" : "closed"}
          aria-hidden={!isOpen}
          inert={!isOpen ? true : undefined}
          className="motion-mobile-panel border-global-navy/10 bg-warm-ivory shadow-navigation absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-var(--tu-navigation-height))] overflow-y-auto overscroll-contain border-t"
          onTransitionEnd={(event) => {
            if (
              event.propertyName === "opacity" &&
              !isOpen &&
              event.currentTarget === event.target
            ) {
              setIsMounted(false);
            }
          }}
        >
          <nav aria-label="Mobile primary navigation" className="px-5 py-6">
            <ul className="grid gap-1">
              {entries.map((entry, index) => (
                <li key={entry.href}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    className="rounded-button text-global-navy hover:bg-global-navy/5 focus-visible:ring-focus block px-3 py-3 text-base font-semibold focus-visible:outline-none"
                    href={entry.href}
                    aria-current={
                      isNavigationPathCurrent(pathname, entry.href)
                        ? "page"
                        : undefined
                    }
                    onClick={() => {
                      closeMenu();
                    }}
                  >
                    {entry.label}
                  </Link>
                  {entry.children ? (
                    <ul className="border-heritage-gold/50 mb-2 ml-5 border-l pl-3">
                      {entry.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            className="rounded-button text-charcoal hover:bg-global-navy/5 focus-visible:ring-focus block px-3 py-2 text-sm focus-visible:outline-none"
                            href={child.href}
                            aria-current={
                              isNavigationPathCurrent(pathname, child.href)
                                ? "page"
                                : undefined
                            }
                            onClick={() => {
                              closeMenu();
                            }}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
            {isHydrated ? (
              signedIn && currentUser ? (
                <ul className="border-global-navy/10 mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2">
                  <li>
                    <Link
                      className="border-global-navy/25 text-global-navy hover:bg-global-navy/5 focus-visible:ring-focus rounded-button flex min-h-11 items-center justify-center border px-4 py-3 text-center text-sm font-semibold focus-visible:outline-none"
                      href="/dashboard/account"
                      onClick={closeMenu}
                    >
                      Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button flex min-h-11 items-center justify-center px-4 py-3 text-center text-sm font-semibold text-white focus-visible:outline-none"
                      href="/workspace/member"
                      onClick={closeMenu}
                    >
                      Open workspace
                    </Link>
                  </li>
                </ul>
              ) : (
                <ul className="border-global-navy/10 mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2">
                  <li>
                    <Link
                      className="border-global-navy/25 text-global-navy hover:bg-global-navy/5 focus-visible:ring-focus rounded-button flex min-h-11 items-center justify-center border px-4 py-3 text-center text-sm font-semibold focus-visible:outline-none"
                      href="/login"
                      onClick={closeMenu}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="bg-global-navy hover:bg-heritage-maroon focus-visible:ring-focus rounded-button flex min-h-11 items-center justify-center px-4 py-3 text-center text-sm font-semibold text-white focus-visible:outline-none"
                      href="/join"
                      onClick={closeMenu}
                    >
                      Join Tamil Ulagam
                    </Link>
                  </li>
                </ul>
              )
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
