import Link from "next/link";

export interface PortalCard {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly marker?: string;
}

export function PortalCardGrid({
  cards,
  columns = 4,
  gridAttribute,
  label,
  linkLabel = "Explore",
  testId,
}: {
  readonly cards: readonly PortalCard[];
  readonly columns?: 3 | 4;
  readonly gridAttribute?: string;
  readonly label?: string;
  readonly linkLabel?: string;
  readonly testId?: string;
}) {
  const basis =
    columns === 3
      ? "sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)]"
      : "sm:basis-[calc(50%-0.5rem)] xl:basis-[calc(25%-0.75rem)]";

  return (
    <ul
      {...(gridAttribute ? { [gridAttribute]: "" } : {})}
      {...(testId ? { "data-testid": testId } : {})}
      {...(label ? { "aria-label": label } : {})}
      data-motion-group
      className="mt-12 flex flex-wrap gap-4"
    >
      {cards.map((card) => (
        <li key={card.title} className={`flex grow basis-full ${basis}`}>
          <article className="rounded-card border-global-navy/[0.09] motion-lift group hover:border-global-navy/20 relative flex h-full w-full flex-col overflow-hidden border bg-white p-6 hover:shadow-[0_1.25rem_3rem_rgba(6,29,50,0.13)]">
            <span
              aria-hidden="true"
              className="gradient-gold-leaf absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1.16,0.36,1)] group-hover:scale-x-100"
            />
            {card.marker ? (
              <span
                aria-hidden="true"
                className="font-display text-gradient-gold text-2xl leading-none font-semibold"
              >
                {card.marker}
              </span>
            ) : null}
            <h3 className="text-global-navy group-hover:text-heritage-maroon mt-4 text-xl font-semibold tracking-[-0.025em] transition-colors duration-300">
              {card.title}
            </h3>
            <p className="text-slate mt-3 flex-1 text-sm leading-6">
              {card.description}
            </p>
            <p className="mt-6">
              <Link
                href={card.href}
                className="text-global-navy group-hover:text-heritage-maroon focus-visible:ring-focus rounded-button inline-flex items-center gap-1.5 text-sm font-bold transition-colors duration-300 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
              >
                {linkLabel}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
