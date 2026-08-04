import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import { footerNavigation } from "@/content/navigation";
import { siteContent, socialLinks } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="bg-deep-navy text-white">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1.35fr_2fr] lg:py-18">
        <div className="max-w-md">
          <Link
            className="focus-visible:ring-focus inline-flex rounded-sm text-xl font-semibold focus-visible:outline-none"
            href="/"
          >
            {siteContent.name}
          </Link>
          <p className="mt-5 text-base leading-7 text-white/72">
            {siteContent.description}
          </p>
          {socialLinks.length > 0 ? (
            <ul aria-label="Official social profiles" className="mt-6">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} aria-label={link.accessibleLabel}>
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav
          aria-label="Footer navigation"
          className="grid gap-8 sm:grid-cols-3"
        >
          {footerNavigation.map((group) => (
            <div key={group.label}>
              <h2 className="text-heritage-gold text-sm font-semibold tracking-[0.12em] uppercase">
                {group.label}
              </h2>
              <ul className="mt-4 grid gap-2">
                {group.children?.map((entry) => (
                  <li key={entry.href}>
                    <Link
                      className="motion-editorial-link focus-visible:ring-focus inline-flex min-h-9 items-center rounded-sm text-[0.9375rem] text-white/82 hover:text-white focus-visible:outline-none"
                      href={entry.href}
                    >
                      {entry.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>
      <div className="border-t border-white/12">
        <Container className="flex flex-col gap-2 py-5 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteContent.name}
          </p>
          <p>Connecting Tamil communities worldwide</p>
        </Container>
      </div>
    </footer>
  );
}
