import type {
  WorkspaceOption,
  WorkspaceType,
} from "@/features/workspace/workspace-options";

/**
 * Subtle, workspace-specific accent (brief section 10) — a colour dot
 * and type label only, never a full-app recolour on switch. Reuses the
 * platform's existing token set (the same colours the Federation Night
 * and Sangam Dusk gradients already draw from) rather than inventing a
 * new palette.
 */
const accentByType: Record<
  WorkspaceType,
  { readonly dotClassName: string; readonly typeLabel: string }
> = {
  member: { dotClassName: "bg-indigo-depth", typeLabel: "Member" },
  organisation: { dotClassName: "bg-heritage-gold", typeLabel: "Organisation" },
  sangam: { dotClassName: "bg-teal-depth", typeLabel: "Tamil Sangam" },
  admin: { dotClassName: "bg-heritage-maroon", typeLabel: "Federation Admin" },
};

export interface WorkspaceIdentityProps {
  readonly loading: boolean;
  readonly current: WorkspaceOption | null;
  /** The workspace type implied by the URL even when `current` could not
   * be resolved (a stale/invalid id) — lets the identity bar still say
   * "Organisation" rather than falling back to something generic. */
  readonly fallbackType: WorkspaceType | null;
  /** The raw entity id from the URL, if any — distinguishes "no
   * particular workspace chosen yet" (the multi-workspace picker screen,
   * `fallbackId` is null) from "a specific id was requested but isn't
   * one of the caller's own workspaces" (a genuinely stale/invalid link,
   * `fallbackId` is set but `current` is still null). Only the second
   * case should read as "Unavailable" — the picker is not an error. */
  readonly fallbackId: string | null;
}

/** "You are currently managing X" (brief section 5) — the always-visible
 * workspace identity readout in the shell header. */
export function WorkspaceIdentity({
  loading,
  current,
  fallbackType,
  fallbackId,
}: WorkspaceIdentityProps) {
  if (loading) {
    return (
      <div className="flex min-w-0 items-center gap-2.5" aria-hidden="true">
        <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-white/25" />
        <span className="h-4 w-32 animate-pulse rounded-sm bg-white/10" />
      </div>
    );
  }

  const type = current?.type ?? fallbackType;
  const accent = type ? accentByType[type] : null;
  const label =
    current?.label ??
    (!type ? "Workspace" : fallbackId ? "Unavailable workspace" : "Choose one");

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`size-2.5 shrink-0 rounded-full ${accent?.dotClassName ?? "bg-white/30"}`}
      />
      <span className="min-w-0 leading-tight">
        <span className="text-heritage-gold block text-[0.65rem] font-bold tracking-[0.14em] uppercase">
          {accent?.typeLabel ?? "Workspace"}
        </span>
        <span className="block max-w-48 truncate text-sm font-bold text-white sm:max-w-72">
          {label}
        </span>
      </span>
    </div>
  );
}
