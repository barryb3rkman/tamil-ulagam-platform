import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  readonly tone?: "neutral" | "success" | "warning" | "maroon";
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs leading-5 font-semibold tracking-wide",
        tone === "neutral" && "bg-slate/12 text-fg-body",
        tone === "success" && "bg-success/12 text-success",
        tone === "warning" && "bg-warning/12 text-fg",
        tone === "maroon" && "bg-fg-accent/12 text-fg-accent",
        className,
      )}
      {...props}
    />
  );
}
