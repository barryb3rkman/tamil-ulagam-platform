import type { ReactNode } from "react";

export interface ImpactStat {
  readonly label: string;
  readonly value: string;
  readonly note?: string;
}

export function ImpactStats({
  stats,
  tone = "light",
}: {
  readonly stats: readonly ImpactStat[];
  readonly tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <dl
      className={`motion-pop-group grid gap-4 sm:grid-cols-2 ${
        stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-card motion-lift relative overflow-hidden border p-6 ${
            dark
              ? "border-white/8 bg-white/[0.04] backdrop-blur-sm"
              : "border-global-navy/[0.09] bg-white shadow-[0_0.75rem_2rem_rgba(6,29,50,0.06)]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`blob pointer-events-none absolute -top-10 -right-8 size-28 ${
              dark ? "bg-heritage-gold/10" : "bg-heritage-gold/12"
            }`}
          />
          <dd
            className={`text-stat relative ${
              dark ? "text-accent-gold" : "text-accent-maroon"
            }`}
          >
            {stat.value}
          </dd>
          <dt
            className={`relative mt-3 text-[0.7rem] font-bold tracking-[0.16em] uppercase ${
              dark ? "text-white/50" : "text-slate"
            }`}
          >
            {stat.label}
          </dt>
          {stat.note ? (
            <p
              className={`relative mt-1.5 text-sm ${
                dark ? "text-white/40" : "text-slate/80"
              }`}
            >
              {stat.note}
            </p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export function ImpactPills({
  items,
  tone = "light",
}: {
  readonly items: readonly string[];
  readonly tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <ul className="motion-pop-group grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-card motion-lift flex items-center gap-3 border px-4 py-3.5 ${
            dark
              ? "border-white/8 bg-white/[0.04] text-white/80"
              : "border-global-navy/[0.09] text-charcoal bg-white shadow-[0_0.5rem_1.5rem_rgba(6,29,50,0.05)]"
          }`}
        >
          <span
            aria-hidden="true"
            className="gradient-gold-leaf text-ink grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold"
          >
            &#10003;
          </span>
          <span className="text-sm font-semibold">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function BlobField({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children?: ReactNode;
}) {
  return (
    <div className={`relative isolate ${className}`}>
      <span
        aria-hidden="true"
        className="blob bg-heritage-gold/10 pointer-events-none absolute -top-16 -left-10 size-64 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="blob-alt bg-vivid-maroon/8 pointer-events-none absolute -right-12 -bottom-20 size-72 blur-2xl"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
