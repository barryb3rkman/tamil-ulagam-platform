import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  readonly shape?: "text" | "block" | "circle";
}

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
