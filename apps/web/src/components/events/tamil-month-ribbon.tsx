import { eventsContent } from "@/content/events";

/**
 * The twelve Tamil months, running.
 *
 * A calendar page that only names Gregorian months is telling half the story:
 * Pongal is Thai, the new year is Chithirai one. This runs the real calendar
 * underneath the federation year, continuously, and pauses when a reader
 * hovers it so a name can actually be read.
 */
export function TamilMonthRibbon() {
  return (
    <section
      aria-labelledby="tamil-month-ribbon-title"
      className="border-hairline border-y py-9"
    >
      <h2 id="tamil-month-ribbon-title" className="sr-only">
        The Tamil calendar
      </h2>
      <div className="marquee">
        <div className="marquee-track gap-0">
          <MonthRun />
          <MonthRun ariaHidden />
        </div>
      </div>
    </section>
  );
}

function MonthRun({ ariaHidden = false }: { readonly ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-baseline"
    >
      {eventsContent.months.map((month) => (
        <li key={month.english} className="flex items-baseline gap-4 px-7">
          <span
            className="font-tamil text-gradient-gold text-2xl leading-none"
            lang="ta"
          >
            {month.tamil}
          </span>
          <span className="text-fg text-sm font-semibold">{month.english}</span>
          <span className="text-fg-muted text-xs tracking-wide">
            {month.span}
          </span>
          <span
            aria-hidden="true"
            className="bg-heritage-gold/40 ml-3 size-1 rounded-full"
          />
        </li>
      ))}
    </ul>
  );
}
