"use client";

import { useId, useState } from "react";

export interface FaqEntry {
  readonly title: string;
  readonly description: string;
}

export function FaqAccordion({
  items,
}: {
  readonly items: readonly FaqEntry[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const base = useId();

  return (
    <dl className="grid gap-3">
      {items.map((item, index) => {
        const panelId = `${base}-${index}`;
        const expanded = open === item.title;
        return (
          <div
            key={item.title}
            className={`rounded-card overflow-hidden border transition-colors duration-300 ${
              expanded
                ? "border-heritage-gold/45 bg-white shadow-[0_1rem_2.5rem_rgba(6,29,50,0.08)]"
                : "border-global-navy/[0.09] hover:border-global-navy/20 bg-white"
            }`}
          >
            <dt>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : item.title)}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="focus-visible:ring-focus group flex w-full items-center justify-between gap-5 px-5 py-5 text-left focus-visible:outline-none sm:px-6"
              >
                <span className="text-global-navy group-hover:text-heritage-maroon text-lg font-bold tracking-[-0.01em] transition-colors">
                  {item.title}
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                    expanded
                      ? "border-heritage-gold/50 bg-heritage-gold/12 text-heritage-maroon rotate-180"
                      : "border-global-navy/12 text-global-navy group-hover:border-heritage-gold/45"
                  }`}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      d="M3.5 6 8 10.5 12.5 6"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </dt>
            {expanded ? (
              <dd
                id={panelId}
                className="text-slate border-global-navy/[0.07] border-t px-5 pt-4 pb-5 leading-7 sm:px-6"
              >
                {item.description}
              </dd>
            ) : null}
          </div>
        );
      })}
    </dl>
  );
}
