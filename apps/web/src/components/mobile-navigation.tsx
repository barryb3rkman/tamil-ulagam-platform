"use client";

import {
  isNavigationPathCurrent,
  type NavigationEntry,
  type UserProfile,
} from "@tamil-ulagam/shared";
import { VisuallyHidden } from "@tamil-ulagam/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export interface MobileNavigationProps {
  readonly entries: readonly NavigationEntry[];
  readonly isHydrated?: boolean;
  readonly signedIn?: boolean;
  readonly currentUser?: UserProfile | null;
}

/** Milliseconds between each row settling into place. */
const rowStagger = 40;

function stagger(index: number): CSSProperties {
  return { "--tu-stagger": `${index * rowStagger}ms` } as CSSProperties;
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
  const scrimRef = useRef<HTMLDivElement>(null);

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

    const scrim = scrimRef.current;
    const closeOnScrim = () => setIsOpen(false);
    scrim?.addEventListener("click", closeOnScrim);

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      scrim?.removeEventListener("click", closeOnScrim);
    };
  }, [isOpen]);

  // The panel reads as one flowing list, so the stagger keeps counting across
  // parents and children rather than restarting inside each group.
  const rows = useMemo(() => {
    const order = new Map<string, number>();
    let next = 0;
    for (const entry of entries) {
      order.set(entry.href, next);
      next += 1;
      for (const child of entry.children ?? []) {
        order.set(`${entry.href}>${child.href}`, next);
        next += 1;
      }
    }
    return { order, total: next };
  }, [entries]);

  return (
    <div className="min-[85rem]:hidden">
      <button
        ref={toggleButtonRef}
        type="button"
        aria-controls="mobile-navigation-panel"
        aria-expanded={isOpen}
        data-state={isOpen ? "open" : "closed"}
        className="motion-control rounded-button border-hairline/25 text-fg hover:bg-fg/10 focus-visible:ring-focus grid size-11 place-items-center border focus-visible:outline-none"
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
        <>
          <div
            ref={scrimRef}
            aria-hidden="true"
            data-state={isOpen ? "open" : "closed"}
            className="motion-menu-scrim bg-ink/55 absolute inset-x-0 top-full z-40 h-[100dvh]"
          />
          <div
            id="mobile-navigation-panel"
            data-state={isOpen ? "open" : "closed"}
            aria-hidden={!isOpen}
            inert={!isOpen ? true : undefined}
            className="motion-mobile-panel gradient-aurora border-heritage-gold/35 absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-var(--tu-navigation-height))] overflow-x-hidden overflow-y-auto overscroll-contain border-t shadow-[0_2rem_5rem_rgba(5,15,28,0.45)]"
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
            <span
              aria-hidden="true"
              className="bg-heritage-gold/12 motion-float pointer-events-none absolute -top-16 -right-20 size-64 rounded-full blur-3xl"
            />
            <span
              aria-hidden="true"
              className="bg-vivid-maroon/12 pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full blur-3xl"
            />

            <nav
              aria-label="Mobile primary navigation"
              className="relative mx-auto w-full max-w-[52rem] px-5 py-7 sm:px-7 sm:py-9"
            >
              <ul className="gap-x-12 sm:columns-2">
                {entries.map((entry, entryIndex) => {
                  const parentRow = rows.order.get(entry.href) ?? 0;
                  return (
                    <li
                      key={entry.href}
                      className="mb-5 break-inside-avoid-column"
                    >
                      <Link
                        ref={entryIndex === 0 ? firstLinkRef : undefined}
                        style={stagger(parentRow)}
                        className="motion-mobile-item group focus-visible:ring-focus-inverse relative flex items-center gap-3 rounded-sm py-2 text-lg font-bold tracking-[-0.01em] text-white focus-visible:outline-none"
                        href={entry.href}
                        aria-current={
                          isNavigationPathCurrent(pathname, entry.href)
                            ? "page"
                            : undefined
                        }
                        onClick={closeMenu}
                      >
                        <span
                          aria-hidden="true"
                          className="bg-heritage-gold ease-premium h-4 w-0.5 shrink-0 origin-center scale-y-0 rounded-full transition-transform duration-300 group-hover:scale-y-100 group-focus-visible:scale-y-100 group-aria-[current=page]:scale-y-100"
                        />
                        <span className="group-hover:text-heritage-gold transition-colors duration-300">
                          {entry.label}
                        </span>
                      </Link>
                      {entry.children ? (
                        <ul className="border-heritage-gold/25 mt-1 ml-[0.4rem] grid border-l pl-4">
                          {entry.children.map((child) => {
                            const childRow =
                              rows.order.get(`${entry.href}>${child.href}`) ??
                              0;
                            return (
                              <li key={child.href}>
                                <Link
                                  style={stagger(childRow)}
                                  className="motion-mobile-item hover:text-heritage-gold focus-visible:ring-focus-inverse block rounded-sm py-1.5 text-sm text-white/70 transition-colors duration-300 focus-visible:outline-none aria-[current=page]:text-white"
                                  href={child.href}
                                  aria-current={
                                    isNavigationPathCurrent(
                                      pathname,
                                      child.href,
                                    )
                                      ? "page"
                                      : undefined
                                  }
                                  onClick={closeMenu}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              {isHydrated ? (
                <ul
                  style={stagger(rows.total)}
                  className="motion-mobile-item mt-2 grid gap-3 border-t border-white/12 pt-6 sm:grid-cols-2"
                >
                  <li>
                    <Link
                      className="focus-visible:ring-focus-inverse rounded-button hover:border-heritage-gold hover:text-heritage-gold flex min-h-12 items-center justify-center border border-white/25 px-4 text-center text-sm font-bold text-white transition-colors duration-300 focus-visible:outline-none"
                      href={
                        signedIn && currentUser
                          ? "/dashboard/account"
                          : "/login"
                      }
                      onClick={closeMenu}
                    >
                      {signedIn && currentUser ? "Account" : "Log in"}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="gradient-gold-leaf text-deep-navy focus-visible:ring-focus-inverse rounded-button motion-lift flex min-h-12 items-center justify-center px-4 text-center text-sm font-bold focus-visible:outline-none"
                      href={
                        signedIn && currentUser ? "/workspace/member" : "/join"
                      }
                      onClick={closeMenu}
                    >
                      {signedIn && currentUser
                        ? "Open workspace"
                        : "Join Tamil Ulagam"}
                    </Link>
                  </li>
                </ul>
              ) : null}

              <p
                style={stagger(rows.total + 1)}
                className="motion-mobile-item font-tamil text-gradient-gold mt-6 text-center text-lg"
                lang="ta"
              >
                ஒன்றிணைவோம் · உயர்வோம்
              </p>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
