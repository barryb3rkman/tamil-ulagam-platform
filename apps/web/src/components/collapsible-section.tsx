"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

export function CollapsibleSection({
  children,
  defaultOpen = false,
  eyebrow,
  headingLevel = 2,
  summary,
  title,
  tone = "light",
}: {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly eyebrow?: string;
  readonly headingLevel?: 2 | 3;
  readonly summary?: string;
  readonly title: string;
  readonly tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const dark = tone === "dark";

  return (
    <section
      className={`rounded-card border ${
        dark
          ? "border-white/12 bg-white/[0.04] backdrop-blur-sm"
          : "border-global-navy/[0.09] bg-white"
      }`}
    >
      <div className="px-5 pt-5 sm:px-6">
        {eyebrow ? (
          <p
            className={`text-[0.64rem] font-bold tracking-[0.16em] uppercase ${
              dark ? "text-heritage-gold/85" : "text-slate"
            }`}
          >
            {eyebrow}
          </p>
        ) : null}
        <Heading className="mt-1.5">
          <button
            type="button"
            id={buttonId}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={panelId}
            className="focus-visible:ring-focus rounded-button group flex w-full items-start justify-between gap-5 text-left focus-visible:outline-none"
          >
            <span
              className={`text-lg font-bold tracking-[-0.01em] transition-colors ${
                dark
                  ? "group-hover:text-heritage-gold text-white"
                  : "text-global-navy group-hover:text-heritage-maroon"
              }`}
            >
              {title}
            </span>
            <span
              aria-hidden="true"
              className={`group-hover:border-heritage-gold/55 group-hover:bg-heritage-gold/10 mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                dark
                  ? "border-white/20 text-white"
                  : "border-global-navy/12 text-global-navy"
              } ${open ? "rotate-180" : ""}`}
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
        </Heading>
        {summary ? (
          <p
            className={`mt-2 pb-5 text-sm leading-6 ${
              dark ? "text-white/70" : "text-slate"
            }`}
          >
            {summary}
          </p>
        ) : (
          <div className="pb-5" />
        )}
      </div>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className={`border-t px-5 pt-5 pb-6 sm:px-6 ${
            dark ? "border-white/10" : "border-global-navy/[0.07]"
          }`}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
