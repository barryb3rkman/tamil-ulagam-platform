import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import {
  workspaceModules,
  type WorkspaceModule,
} from "@/content/workspace-modules";
import type { WorkspaceType } from "@/features/workspace/workspace-options";
import { moduleHref } from "@/features/workspace/module-routes";

import { ModuleIcon } from "./module-icons";

export function ModuleComingSoon({
  workspaceModule,
  workspaceType,
  entityId,
  workspaceLabel,
}: {
  readonly workspaceModule: WorkspaceModule;
  readonly workspaceType: WorkspaceType;
  readonly entityId: string | null;
  readonly workspaceLabel: string;
}) {
  const backHref =
    workspaceType === "organisation" && entityId
      ? `/workspace/organisation?organization=${entityId}`
      : workspaceType === "sangam" && entityId
        ? `/workspace/sangam?sangam=${entityId}`
        : "/workspace/member";

  const siblings = workspaceModules.filter(
    (candidate) => candidate.id !== workspaceModule.id,
  );

  return (
    <Container size="wide" className="py-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10">
      <section className="gradient-aurora rounded-large glow-ring relative isolate overflow-hidden px-6 py-12 sm:px-10 sm:py-16">
        <div
          aria-hidden="true"
          data-motion-ambient
          className="bg-heritage-gold/12 motion-float pointer-events-none absolute -top-20 right-10 size-72 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          data-motion-ambient
          className="bg-aurora-violet/25 motion-float pointer-events-none absolute -bottom-24 left-8 size-80 rounded-full blur-3xl [animation-delay:2.2s]"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <span
            aria-hidden="true"
            className="border-heritage-gold/30 text-heritage-gold mx-auto grid size-20 place-items-center rounded-3xl border bg-white/[0.06] backdrop-blur-sm"
          >
            <ModuleIcon
              moduleId={workspaceModule.id}
              className="size-9 shrink-0"
            />
          </span>

          <p className="text-heritage-gold/85 mt-7 text-[0.68rem] font-bold tracking-[0.24em] uppercase">
            Tamil Ulagam programme
          </p>
          <h1 className="text-display text-gradient-gold mt-3">
            {workspaceModule.label}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/65">
            {workspaceModule.description}
          </p>

          <div className="mt-9 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="bg-heritage-gold size-2 animate-pulse rounded-full"
            />
            <span className="text-[0.72rem] font-bold tracking-[0.16em] text-white/75 uppercase">
              In development
            </span>
          </div>

          <p className="mx-auto mt-6 max-w-lg leading-7 text-white/50">
            This programme area is part of Tamil Ulagam&rsquo;s roadmap and
            isn&rsquo;t open yet. There&rsquo;s nothing to set up here — it will
            appear in your workspace as it becomes available.
          </p>
        </div>
      </section>

      <div className="mt-10">
        <h2 className="text-section-title text-gradient-ink">
          The rest of the programme
        </h2>
        <p className="text-slate mt-2 max-w-2xl text-sm leading-6">
          Eleven areas make up the federation&rsquo;s work. Here is everything
          else being built alongside {workspaceModule.shortLabel}.
        </p>
      </div>

      <ul
        data-motion-group
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {siblings.map((sibling) => {
          const href = moduleHref(workspaceType, entityId, sibling.id);
          if (!href) return null;
          return (
            <li key={sibling.id} className="min-w-0">
              <Link
                href={href}
                className="border-global-navy/[0.09] rounded-card motion-lift focus-visible:ring-focus hover:border-heritage-gold/45 group flex min-h-[4.5rem] items-center gap-3.5 border bg-white px-4 py-3.5 hover:shadow-[0_1rem_2.5rem_rgba(6,29,50,0.1)] focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="border-global-navy/10 text-global-navy/60 group-hover:border-heritage-gold/45 group-hover:bg-heritage-gold/10 group-hover:text-heritage-maroon grid size-10 shrink-0 place-items-center rounded-xl border transition-colors duration-300"
                >
                  <ModuleIcon moduleId={sibling.id} />
                </span>
                <span className="text-global-navy min-w-0 truncate text-sm font-bold">
                  {sibling.shortLabel}
                </span>
                <span
                  aria-hidden="true"
                  className="text-global-navy/25 group-hover:text-heritage-maroon ml-auto shrink-0 transition-all duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-9">
        <Link
          href={backHref}
          className="border-global-navy/12 text-global-navy hover:border-heritage-gold/55 hover:bg-heritage-gold/8 focus-visible:ring-focus rounded-button motion-control inline-flex min-h-11 items-center gap-2 border bg-white px-5 text-sm font-bold focus-visible:outline-none"
        >
          <span aria-hidden="true">&larr;</span>
          Back to {workspaceLabel}
        </Link>
      </p>
    </Container>
  );
}
