import type { ReactNode } from "react";

import { RipplesIllustration } from "@/components/illustration/brand-illustrations";

export interface MosaicItem {
  readonly title: string;
  readonly description?: string;
}

export function EditorialMosaic({
  figure,
  headingLevel = 3,
  items,
  tone = "light",
}: {
  readonly figure?: ReactNode;
  readonly headingLevel?: 3 | 4;
  readonly items: readonly MosaicItem[];
  readonly tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const Title = headingLevel === 3 ? "h3" : "h4";
  const [lead, ...rest] = items;
  if (!lead) return null;
  const leadFigure = figure ?? <RipplesIllustration />;

  const shell = dark
    ? "border-white/12 bg-white/[0.045] hover:border-heritage-gold/40"
    : "border-global-navy/10 hover:border-heritage-gold/45 bg-white";

  return (
    <div data-motion-group className="mt-10 flex flex-wrap gap-4">
      <article
        className={`rounded-large motion-lift group relative isolate flex min-h-[19rem] grow basis-full flex-col justify-end overflow-hidden border p-7 sm:p-9 lg:basis-[calc(66.666%-0.667rem)] ${shell}`}
      >
        <div
          className={`pointer-events-none absolute -top-10 -right-12 w-72 transition-transform duration-700 ease-[cubic-bezier(0.22,1.16,0.36,1)] group-hover:-translate-y-2 sm:w-96 ${
            dark
              ? "text-white/70 opacity-40"
              : "text-global-navy opacity-[0.11]"
          }`}
        >
          {leadFigure}
        </div>
        <span
          aria-hidden="true"
          className="gradient-gold-leaf mb-6 block h-1 w-12 rounded-full"
        />
        <Title
          className={`font-display relative text-3xl leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[2.5rem] ${
            dark ? "text-white" : "text-gradient-ink"
          }`}
        >
          {lead.title}
        </Title>
        {lead.description ? (
          <p
            className={`relative mt-4 max-w-lg text-[1.0625rem] leading-8 ${
              dark ? "text-white/70" : "text-slate"
            }`}
          >
            {lead.description}
          </p>
        ) : null}
      </article>

      {rest.map((item) => (
        <article
          key={item.title}
          className={`rounded-card motion-lift group relative grow basis-full overflow-hidden border p-6 sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)] ${shell}`}
        >
          <span
            aria-hidden="true"
            className="gradient-gold-leaf absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1.16,0.36,1)] group-hover:scale-x-100"
          />
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="gradient-gold-leaf mt-2 block size-1.5 shrink-0 rounded-full"
            />
            <div className="min-w-0">
              <Title
                className={`text-[1.0625rem] font-bold tracking-[-0.01em] ${
                  dark ? "text-white" : "text-global-navy"
                }`}
              >
                {item.title}
              </Title>
              {item.description ? (
                <p
                  className={`mt-2 text-[0.9375rem] leading-7 ${
                    dark ? "text-white/68" : "text-slate"
                  }`}
                >
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
