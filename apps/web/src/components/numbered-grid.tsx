export function NumberedGrid({
  columns = 2,
  gridAttribute,
  headingLevel,
  itemAttribute,
  items,
  startAt = 1,
  tone = "light",
}: {
  readonly columns?: 2 | 3;
  readonly gridAttribute?: string;
  readonly headingLevel?: 3 | 4;
  readonly itemAttribute?: string;
  readonly startAt?: number;
  readonly items: readonly (
    | string
    | {
        title: string;
        description?: string;
        href?: string;
        linkLabel?: string;
      }
  )[];
  readonly tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const Title = headingLevel === 3 ? "h3" : headingLevel === 4 ? "h4" : "p";
  return (
    <ol
      {...(gridAttribute ? { [gridAttribute]: "" } : {})}
      className="motion-pop-group flex flex-wrap gap-4"
    >
      {items.map((entry, index) => {
        const title = typeof entry === "string" ? entry : entry.title;
        const description =
          typeof entry === "string" ? undefined : entry.description;
        const href = typeof entry === "string" ? undefined : entry.href;
        const linkLabel =
          typeof entry === "string" ? undefined : entry.linkLabel;
        return (
          <li
            key={title}
            {...(itemAttribute ? { [itemAttribute]: "" } : {})}
            className={`rounded-card motion-lift group relative grow basis-full overflow-hidden border p-5 sm:p-6 ${
              columns === 3
                ? "sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)]"
                : "sm:basis-[calc(50%-0.5rem)]"
            } ${
              dark
                ? "border-white/8 bg-white/[0.04] backdrop-blur-sm hover:border-white/16"
                : "border-global-navy/[0.09] hover:border-heritage-gold/45 bg-white hover:shadow-[0_1rem_2.5rem_rgba(6,29,50,0.09)]"
            }`}
          >
            <span
              aria-hidden="true"
              className="gradient-gold-leaf absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
            />
            <span
              aria-hidden="true"
              className="blob bg-heritage-gold/12 pointer-events-none absolute -top-6 -left-4 size-20 blur-xl"
            />
            <span
              aria-hidden="true"
              className={`font-display relative grid size-11 place-items-center rounded-2xl border text-sm font-semibold ${
                dark
                  ? "border-heritage-gold/30 text-heritage-gold bg-white/[0.06]"
                  : "border-heritage-gold/40 text-heritage-maroon bg-white shadow-[0_0.5rem_1.25rem_rgba(214,168,75,0.18)]"
              }`}
            >
              {String(index + startAt).padStart(2, "0")}
            </span>
            <Title
              className={`relative mt-4 leading-7 font-bold ${
                dark ? "text-white/90" : "text-global-navy"
              } ${headingLevel ? "text-lg tracking-[-0.01em]" : ""}`}
            >
              {title}
            </Title>
            {description ? (
              <p
                className={`relative mt-1.5 text-sm leading-6 ${
                  dark ? "text-white/55" : "text-slate"
                }`}
              >
                {description}
              </p>
            ) : null}
            {href && linkLabel ? (
              <a
                href={href}
                className={`focus-visible:ring-focus relative mt-4 inline-flex items-center gap-1.5 text-sm font-bold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none ${
                  dark
                    ? "text-heritage-gold hover:text-white"
                    : "text-global-navy group-hover:text-heritage-maroon"
                }`}
              >
                {linkLabel}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </a>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function CheckGrid({
  columns = 2,
  items,
  marker = "check",
  tone = "light",
}: {
  readonly columns?: 2 | 3;
  readonly items: readonly string[];
  readonly marker?: "check" | "exclude";
  readonly tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <ul className="motion-pop-group flex flex-wrap gap-3">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-card motion-lift flex grow basis-full items-start gap-3 border px-4 py-3.5 ${
            columns === 3
              ? "sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(33.333%-0.5rem)]"
              : "sm:basis-[calc(50%-0.375rem)]"
          } ${
            dark
              ? "border-white/8 bg-white/[0.04] text-white/80 backdrop-blur-sm"
              : "border-global-navy/[0.09] text-charcoal hover:border-heritage-gold/45 bg-white"
          }`}
        >
          <span
            aria-hidden="true"
            className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold ${
              marker === "exclude"
                ? dark
                  ? "border border-white/25 text-white/55"
                  : "border-global-navy/20 text-slate border"
                : "gradient-gold-leaf text-ink"
            }`}
          >
            {marker === "exclude" ? "\u00d7" : "\u2713"}
          </span>
          <span className="text-sm leading-6 font-semibold">{item}</span>
        </li>
      ))}
    </ul>
  );
}
