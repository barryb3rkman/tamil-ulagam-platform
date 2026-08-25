import type { ReactNode } from "react";

import { Badge, type BadgeProps } from "./badge";
import { cx } from "./utils";

export interface StatusBadgeProps {
  readonly tone?: BadgeProps["tone"];
  readonly label: string;
  /** Optional icon shown before the dot (e.g. a checkmark for a
   * "verified"-style state). Defaults to a plain tone-colored dot,
   * matching the existing status-badge convention used throughout the
   * app — status is never communicated by color alone. */
  readonly icon?: ReactNode;
  readonly className?: string;
}

/**
 * A status pill: tone-colored dot (or a supplied icon) plus a label.
 * Generalizes the existing RegistrationStatusBadge pattern for any
 * lifecycle status (membership, partnership, verification) rather than
 * one domain's status enum — the domain-specific status→tone mapping
 * stays in apps/web (see e.g. registrationStatusPresentation).
 */
export function StatusBadge({
  className,
  icon,
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <Badge tone={tone} className={cx("gap-2 py-1.5", className)}>
      {icon ?? (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      )}
      {label}
    </Badge>
  );
}
