import { workspaceModules } from "@/content/workspace-modules";

import { ModuleIcon } from "./module-icons";

export function ProgrammeTicker() {
  return (
    <div
      className="marquee border-y border-white/8 bg-white/[0.02] py-3"
      role="presentation"
    >
      <div className="marquee-track">
        <TickerRun />
        <TickerRun ariaHidden />
      </div>
    </div>
  );
}

function TickerRun({ ariaHidden = false }: { readonly ariaHidden?: boolean }) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-9 pr-9"
    >
      {workspaceModules.map((workspaceModule) => (
        <li
          key={workspaceModule.id}
          className="flex shrink-0 items-center gap-2.5 text-white/45"
        >
          <ModuleIcon
            moduleId={workspaceModule.id}
            className="size-4 shrink-0 text-white/30"
          />
          <span className="text-[0.72rem] font-semibold tracking-[0.2em] whitespace-nowrap uppercase">
            {workspaceModule.shortLabel}
          </span>
          <span aria-hidden="true" className="text-heritage-gold/40 text-xs">
            &#9670;
          </span>
        </li>
      ))}
    </ul>
  );
}
