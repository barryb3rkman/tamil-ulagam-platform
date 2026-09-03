export interface NumeralItem {
  readonly title: string;
  readonly description?: string;
}

export function NumeralFeature({
  columns = 3,
  headingLevel = 3,
  itemAttribute,
  items,
  label,
  startAt = 1,
  tone = "light",
}: {
  readonly columns?: 2 | 3;
  readonly headingLevel?: 3 | 4;
  readonly itemAttribute?: string;
  readonly items: readonly NumeralItem[];
  readonly label?: string;
  readonly startAt?: number;
  readonly tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const Title = headingLevel === 3 ? "h3" : "h4";
  const basis =
    columns === 2
      ? "sm:basis-[calc(50%-0.5rem)]"
      : "sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)]";

  return (
    <ol
      data-motion-group
      {...(label ? { "aria-label": label } : {})}
      className="mt-10 flex flex-wrap gap-4"
    >
      {items.map((item, index) => {
        const numeral = String(startAt + index).padStart(2, "0");
        return (
          <li
            key={item.title}
            {...(itemAttribute ? { [itemAttribute]: "" } : {})}
            className={`rounded-card motion-lift group relative isolate grow basis-full overflow-hidden border p-6 sm:p-7 ${basis} ${
              dark
                ? "hover:border-heritage-gold/40 border-white/12 bg-white/[0.045]"
                : "border-global-navy/10 hover:border-heritage-gold/45 bg-white"
            }`}
          >
            <span
              aria-hidden="true"
              className="gradient-gold-leaf absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1.16,0.36,1)] group-hover:scale-x-100"
            />
            <span
              aria-hidden="true"
              className={`font-display pointer-events-none absolute -top-5 -right-1 -z-10 text-[5.5rem] leading-none font-semibold tracking-[-0.04em] transition-transform duration-700 ease-[cubic-bezier(0.22,1.16,0.36,1)] group-hover:-translate-y-1 sm:text-[7rem] ${
                dark
                  ? "text-white opacity-[0.07]"
                  : "text-gradient-gold opacity-[0.22]"
              }`}
            >
              {numeral}
            </span>
            <span
              aria-hidden="true"
              className="gradient-gold-leaf mb-4 block h-0.5 w-8 rounded-full"
            />
            <Title
              className={`text-[1.0625rem] font-bold tracking-[-0.01em] sm:text-lg ${
                dark ? "text-white" : "text-global-navy"
              }`}
            >
              {item.title}
            </Title>
            {item.description ? (
              <p
                className={`mt-2.5 text-[0.9375rem] leading-7 ${
                  dark ? "text-white/68" : "text-slate"
                }`}
              >
                {item.description}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
