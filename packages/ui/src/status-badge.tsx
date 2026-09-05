import type { ReactNode } from "react";

import { Badge, type BadgeProps } from "./badge";
import { cx } from "./utils";

export interface StatusBadgeProps {
  readonly tone?: BadgeProps["tone"];
  readonly label: string;
  readonly icon?: ReactNode;
  readonly className?: string;
}

export function StatusBadge({
  className,
  icon,
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    // A stable hook for end-to-end specs. Status words like "Active"
    // also appear as stat-rail labels and column headings, so matching
    // them by text alone is ambiguous.
    <Badge
      tone={tone}
      className={cx("gap-2 py-1.5", className)}
      data-status-badge={label}
    >
      {icon ?? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      )}
      {label}
    </Badge>
  );
}
