import Link from "next/link";
import type { ReactNode } from "react";

import { AnimatedCounter } from "./animated-counter";
import { LiveClock } from "./live-clock";
import { ProgrammeTicker } from "./programme-ticker";

export interface WorkspaceStat {
  readonly label: string;
  readonly value: number;
  readonly tone?: "default" | "attention";
}

export function WorkspaceMasthead({
  actions,
  description,
  eyebrow,
  location,
  showMonogram = true,
  stats = [],
  status,
  title,
  updatedAt,
}: {
  readonly actions?: ReactNode;
  readonly description?: string;
  readonly eyebrow: string;
  readonly location?: string;
  readonly showMonogram?: boolean;
  readonly stats?: readonly WorkspaceStat[];
  readonly status?: ReactNode;
  readonly title: string;
  readonly updatedAt?: number;
}) {
  const monogram = title.trim().charAt(0).toUpperCase() || "T";

  return (
    <header className="gradient-aurora rounded-large glow-ring relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        data-motion-ambient
        className="bg-heritage-gold/12 motion-float pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        data-motion-ambient
        className="bg-vivid-maroon/18 motion-float pointer-events-none absolute -bottom-28 left-1/3 size-80 rounded-full blur-3xl [animation-delay:1.8s]"
      />

      <div className="relative px-6 pt-8 pb-7 sm:px-9 sm:pt-11 sm:pb-9">
        <div className="flex flex-wrap items-start justify-between gap-7">
          <div className="flex min-w-0 items-start gap-4">
            {showMonogram ? (
              <span
                aria-hidden="true"
                className="gradient-gold-leaf text-ink font-display grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-semibold shadow-[0_0.75rem_2rem_rgba(214,168,75,0.32)]"
              >
                {monogram}
              </span>
            ) : null}
            <div className="min-w-0">
              <p className="text-heritage-gold/85 text-[0.68rem] font-bold tracking-[0.22em] uppercase">
                {eyebrow}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-page-title text-gradient-gold min-w-0">
                  {title}
                </h1>
                {status}
              </div>
              {location ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
                  <span
                    aria-hidden="true"
                    className="bg-heritage-gold/60 inline-block size-1.5 rounded-full"
                  />
                  {location}
                </p>
              ) : null}
              {description ? (
                <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-white/62">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {actions ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
            <LiveClock updatedAt={updatedAt} />
          </div>
        </div>

        {stats.length > 0 ? <StatRail stats={stats} /> : null}
      </div>

      <ProgrammeTicker />
    </header>
  );
}

function StatRail({ stats }: { readonly stats: readonly WorkspaceStat[] }) {
  return (
    <dl
      data-motion-group
      className={`mt-9 grid grid-cols-2 gap-3 ${
        stats.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
      }`}
    >
      {stats.map((stat) => {
        const attention = stat.tone === "attention";
        return (
          <div
            key={stat.label}
            className={`shimmer rounded-card motion-lift relative border px-5 py-4 backdrop-blur-sm ${
              attention
                ? "border-heritage-gold/35 bg-heritage-gold/[0.07] hover:border-heritage-gold/55"
                : "border-white/8 bg-white/[0.045] hover:border-white/16"
            }`}
          >
            <dd
              className={`font-display text-[2.5rem] leading-none font-semibold tracking-[-0.02em] ${
                attention ? "text-gradient-gold" : "text-white/92"
              }`}
            >
              <AnimatedCounter value={stat.value} />
            </dd>
            <dt className="mt-2.5 text-[0.68rem] font-bold tracking-[0.16em] text-white/45 uppercase">
              {stat.label}
            </dt>
          </div>
        );
      })}
    </dl>
  );
}

export function WorkspaceSectionHeading({
  description,
  title,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-section-title text-gradient-ink">{title}</h2>
      {description ? (
        <p className="text-slate mt-2 text-sm leading-6">{description}</p>
      ) : null}
    </div>
  );
}

export function WorkspacePanel({
  children,
  className = "",
  description,
  eyebrow,
  href,
  icon,
  linkLabel,
  title,
}: {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly description?: string;
  readonly eyebrow?: string;
  readonly href?: string;
  readonly icon?: ReactNode;
  readonly linkLabel?: string;
  readonly title: string;
}) {
  const body = (
    <>
      {href ? (
        <span
          aria-hidden="true"
          className="gradient-gold-leaf absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-slate text-[0.64rem] font-bold tracking-[0.16em] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="text-global-navy mt-1.5 text-[1.0625rem] font-bold tracking-[-0.01em]">
            {title}
          </h3>
        </div>
        {icon ? (
          <span
            aria-hidden="true"
            className={`grid size-10 shrink-0 place-items-center rounded-xl border transition-colors duration-300 ${
              href
                ? "border-global-navy/10 text-global-navy/70 group-hover:border-heritage-gold/45 group-hover:bg-heritage-gold/10 group-hover:text-heritage-maroon bg-white"
                : "border-global-navy/8 text-global-navy/35 bg-white"
            }`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="text-slate mt-3 max-w-xl text-sm leading-6">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
      {href && linkLabel ? (
        <p className="mt-auto pt-5">
          <Link
            href={href}
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
      ) : null}
    </>
  );

  const shell = `border-global-navy/[0.09] rounded-card relative flex h-full min-h-48 flex-col overflow-hidden border bg-white p-5 sm:p-6 ${className}`;

  if (href) {
    return (
      <section
        className={`${shell} motion-lift group hover:border-global-navy/20 hover:shadow-[0_1.25rem_3rem_rgba(6,29,50,0.13)]`}
      >
        {body}
      </section>
    );
  }

  return <section className={shell}>{body}</section>;
}

export const workspacePrimaryActionClassName =
  "gradient-gold-leaf text-ink focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center px-5 text-sm font-bold shadow-[0_0.5rem_1.5rem_rgba(214,168,75,0.28)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none";

export const workspaceSecondaryActionClassName =
  "border-white/18 text-white/85 hover:border-heritage-gold/50 hover:bg-white/8 hover:text-white focus-visible:ring-focus-inverse rounded-button motion-control inline-flex min-h-11 items-center border bg-white/[0.06] px-5 text-sm font-semibold backdrop-blur-sm focus-visible:outline-none";

export const panelActionClassName =
  "border-global-navy/12 text-global-navy hover:border-heritage-gold/55 hover:bg-heritage-gold/8 focus-visible:ring-focus rounded-button motion-control inline-flex min-h-10 items-center gap-1.5 border bg-white px-3.5 text-sm font-bold focus-visible:outline-none";
