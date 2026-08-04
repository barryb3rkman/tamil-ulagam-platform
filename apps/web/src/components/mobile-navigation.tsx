"use client";

import type { NavigationEntry } from "@tamil-ulagam/shared";
import { VisuallyHidden } from "@tamil-ulagam/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LanguageSelector } from "./language-selector";

export interface MobileNavigationProps {
  readonly entries: readonly NavigationEntry[];
}

export function MobileNavigation({ entries }: MobileNavigationProps) {
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
    <div className="lg:hidden">
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
          className="motion-mobile-panel border-global-navy/10 bg-warm-ivory shadow-navigation absolute inset-x-0 top-full z-50 border-t"
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
                      pathname === entry.href ||
                      (entry.href === "/initiatives" &&
                        pathname.startsWith("/initiatives/"))
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
                              pathname === child.href ? "page" : undefined
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
            <div className="border-global-navy/10 text-global-navy mt-5 border-t pt-5">
              <LanguageSelector />
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
