import Link from "next/link";

export interface InitiativeBreadcrumbsProps {
  readonly currentTitle: string;
}

export function InitiativeBreadcrumbs({
  currentTitle,
}: InitiativeBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="text-slate flex flex-wrap items-center gap-x-2 gap-y-1">
        <li>
          <Link
            className="text-global-navy hover:text-heritage-maroon focus-visible:ring-focus decoration-heritage-gold/70 rounded-sm font-semibold underline underline-offset-4 focus-visible:outline-none"
            href="/"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="text-heritage-gold">
          →
        </li>
        <li>
          <Link
            className="text-global-navy hover:text-heritage-maroon focus-visible:ring-focus decoration-heritage-gold/70 rounded-sm font-semibold underline underline-offset-4 focus-visible:outline-none"
            href="/initiatives"
          >
            Initiatives
          </Link>
        </li>
        <li aria-hidden="true" className="text-heritage-gold">
          →
        </li>
        <li aria-current="page" className="text-charcoal font-semibold">
          {currentTitle}
        </li>
      </ol>
    </nav>
  );
}
