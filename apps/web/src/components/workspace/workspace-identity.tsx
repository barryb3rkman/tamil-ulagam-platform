import type {
  WorkspaceOption,
  WorkspaceType,
} from "@/features/workspace/workspace-options";

const accentByType: Record<
  WorkspaceType,
  { readonly dotClassName: string; readonly typeLabel: string }
> = {
  member: { dotClassName: "bg-indigo-depth", typeLabel: "Member" },
  organisation: { dotClassName: "bg-heritage-gold", typeLabel: "Organisation" },
  sangam: { dotClassName: "bg-teal-depth", typeLabel: "Tamil Sangam" },
  admin: { dotClassName: "bg-heritage-maroon", typeLabel: "Federation Admin" },
};

export function workspaceTypeLabel(type: WorkspaceType | null): string {
  return type ? accentByType[type].typeLabel : "Workspace";
}

export interface WorkspaceIdentityProps {
  readonly loading: boolean;
  readonly current: WorkspaceOption | null;
  readonly fallbackType: WorkspaceType | null;
  readonly fallbackId: string | null;
}

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
        <span className="text-heritage-gold text-eyebrow-sm block">
          {accent?.typeLabel ?? "Workspace"}
        </span>
        <span className="block max-w-48 truncate text-sm font-bold text-white sm:max-w-72">
          {label}
        </span>
      </span>
    </div>
  );
}
