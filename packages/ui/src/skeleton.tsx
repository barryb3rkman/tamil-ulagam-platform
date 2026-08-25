import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  readonly shape?: "text" | "block" | "circle";
}

/**
 * A loading placeholder shaped to match the final content's dimensions
 * (pass `className`/`style` with explicit width/height) so content
 * never shifts layout when it swaps in. Renders with `aria-hidden` —
 * the loading region itself should carry `role="status"` with an
 * accessible label, not this element.
 */
export function Skeleton({
  className,
  shape = "block",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-motion-skeleton=""
      className={cx(
        "bg-global-navy/8",
        shape === "text" && "h-4 rounded-sm",
        shape === "block" && "rounded-card",
        shape === "circle" && "rounded-full",
        className,
      )}
      {...props}
    />
  );
}
