"use client";

import { Container } from "@tamil-ulagam/ui";
import Link from "next/link";

import { eventsContent } from "@/content/events";
import {
  moduleCapabilities,
  workspaceModuleContent,
} from "@/content/workspace-module-content";
import {
  workspaceModules,
  type WorkspaceModule,
} from "@/content/workspace-modules";
import { moduleHref } from "@/features/workspace/module-routes";
import { useWorkspacePeopleStats } from "@/features/workspace/use-workspace-people-stats";
import type { WorkspaceType } from "@/features/workspace/workspace-options";

import { ModuleIcon } from "./module-icons";

/**
 * A programme area inside a workspace.
 *
 * Every module used to render the same placeholder, so eleven tiles led to
 * one room. This shows what the programme actually contains — the capability
 * lines the source presentation sets out, which were already in the
 * repository behind the public initiative pages — alongside the live numbers
 * for the organisation the member is standing in.
 *
 * It is still honest about what is not built. "What you can do today" lists
 * only what genuinely works; the capabilities below it are what the programme
 * covers, marked as the roadmap they are. Better a member sees the shape of
 * the thing and where it has got to than a blank page that tells them nothing.
 */
export function ModuleProgramme({
  workspaceModule,
  workspaceType,
  entityId,
  workspaceLabel,
}: {
  readonly workspaceModule: WorkspaceModule;
  readonly workspaceType: Exclude<WorkspaceType, "admin">;
  readonly entityId: string | null;
  readonly workspaceLabel: string;
}) {
  const content = workspaceModuleContent[workspaceModule.id];
  const capabilities = moduleCapabilities(workspaceModule.id);
  const stats = useWorkspacePeopleStats(entityId);

  const backHref =
    workspaceType === "organisation" && entityId
      ? `/workspace/organisation?organization=${entityId}`
      : workspaceType === "sangam" && entityId
        ? `/workspace/sangam?sangam=${entityId}`
        : "/workspace/member";

  // moduleHref returns null when a workspace type has no entity to hang the
  // route on, so a sibling without a destination is simply not offered.
  const siblings = workspaceModules
    .filter((candidate) => candidate.id !== workspaceModule.id)
    .map((candidate) => ({
      module: candidate,
      href: moduleHref(workspaceType, entityId, candidate.id),
    }))
    .filter(
      (entry): entry is { module: WorkspaceModule; href: string } =>
        entry.href !== null,
    );

  return (
    <Container size="wide" className="py-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10">
      <section className="module-masthead rounded-large relative isolate overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
        <span aria-hidden="true" className="module-masthead-glow" />

        <div className="relative flex flex-wrap items-start gap-6">
          <span
            aria-hidden="true"
            className="border-heritage-gold/30 text-heritage-gold grid size-16 shrink-0 place-items-center rounded-2xl border bg-white/[0.06]"
          >
            <ModuleIcon
              moduleId={workspaceModule.id}
              className="size-8 shrink-0"
            />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-heritage-gold/85 text-[0.66rem] font-bold tracking-[0.24em] uppercase">
              {workspaceLabel}
            </p>
            {content ? (
              <p
                className="font-tamil text-gradient-gold mt-2 text-xl leading-snug"
                lang="ta"
              >
                {content.tamilLabel}
              </p>
            ) : null}
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              {workspaceModule.label}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/65">
              {workspaceModule.description}
            </p>
          </div>
        </div>

        {/* Real numbers for the organisation this member is standing in. Shown
            only where there is one — the member workspace has no roll of its
            own to count. */}
        {entityId && stats.status === "loaded" ? (
          <dl className="relative mt-9 flex flex-wrap gap-x-12 gap-y-5 border-t border-white/10 pt-7">
            <Figure label="Members" value={stats.approvedCount} />
            <Figure label="Awaiting review" value={stats.pendingCount} />
            <Figure label="Managers" value={stats.managerCount} />
          </dl>
        ) : null}
      </section>

      {content && content.whatYouCanDoNow.length > 0 ? (
        <section aria-labelledby="module-now-title" className="mt-10">
          <h2 id="module-now-title" className="text-section-title text-fg">
            What you can do today
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {content.whatYouCanDoNow.map((item) => (
              <li key={item} className="module-now-row">
                <span aria-hidden="true" className="module-now-tick">
                  ✓
                </span>
                <span className="text-fg-body leading-7">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {capabilities.length > 0 ? (
        <section aria-labelledby="module-covers-title" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="module-covers-title" className="text-section-title text-fg">
              What this programme covers
            </h2>
            <p className="text-fg-muted text-sm">
              Being built across the federation
            </p>
          </div>
          <ol className="mt-5 grid gap-0 md:grid-cols-2 md:gap-x-10">
            {capabilities.map((capability, index) => (
              <li key={capability.title} className="module-capability">
                <span aria-hidden="true" className="module-capability-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-fg font-semibold">{capability.title}</h3>
                  <p className="text-fg-muted mt-1.5 text-sm leading-6">
                    {capability.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* The events programme is the one with a live calendar behind it, so it
          shows the calendar rather than describing it. */}
      {workspaceModule.id === "events" ? (
        <section aria-labelledby="module-calendar-title" className="mt-12">
          <h2 id="module-calendar-title" className="text-section-title text-fg">
            The federation year
          </h2>
          <ul className="border-hairline mt-5 grid gap-0 border-t">
            {eventsContent.signature.map((event) => (
              <li key={event.slug} className="module-calendar-row">
                <span className="module-calendar-month">{event.month}</span>
                <div className="min-w-0">
                  <p
                    className="font-tamil text-fg-accent text-sm leading-snug"
                    lang="ta"
                  >
                    {event.tamilTitle}
                  </p>
                  <p className="text-fg mt-0.5 font-semibold">{event.title}</p>
                </div>
                <p className="text-fg-muted hidden text-sm leading-6 sm:block">
                  {event.summary}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="module-more-title" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="module-more-title" className="text-section-title text-fg">
            The rest of the programme
          </h2>
          <Link
            href={backHref}
            className="text-fg focus-visible:ring-focus decoration-heritage-gold text-sm font-semibold underline decoration-2 underline-offset-4 focus-visible:outline-none"
          >
            Back to {workspaceLabel}
          </Link>
        </div>
        <ul
          data-motion-group="stagger"
          className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {siblings.map(({ module: sibling, href }) => (
            <li key={sibling.id}>
              <Link
                href={href}
                className="module-sibling focus-visible:ring-focus flex items-center gap-3 focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="text-heritage-gold/80 shrink-0"
                >
                  <ModuleIcon moduleId={sibling.id} className="size-5" />
                </span>
                <span className="text-fg text-sm font-semibold">
                  {sibling.shortLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}

function Figure({
  label,
  value,
}: {
  readonly label: string;
  readonly value: number;
}) {
  return (
    <div>
      <dt className="text-[0.66rem] font-bold tracking-[0.2em] text-white/50 uppercase">
        {label}
      </dt>
      <dd className="text-gradient-gold mt-1.5 text-3xl font-semibold tracking-[-0.02em] tabular-nums">
        {value}
      </dd>
    </div>
  );
}
