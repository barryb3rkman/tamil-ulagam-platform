import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";

import { cx } from "./utils";

export interface LinkButtonProps
  extends
    LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  readonly variant?: "primary" | "secondary" | "text";
  readonly size?: "small" | "medium" | "large";
}

export function LinkButton({
  className,
  size = "medium",
  variant = "primary",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cx(
        "motion-control rounded-button focus-visible:ring-focus inline-flex items-center justify-center font-semibold focus-visible:outline-none",
        variant === "primary" &&
          "bg-action hover:bg-action-hover text-action-fg",
        variant === "secondary" &&
          "border-hairline-strong text-fg hover:bg-fg hover:text-fg-inverse border bg-transparent",
        variant === "text" &&
          "motion-editorial-link text-fg hover:text-fg-accent rounded-none px-0",
        size === "small" && variant !== "text" && "min-h-10 px-4 py-2 text-sm",
        size === "medium" &&
          variant !== "text" &&
          "min-h-11 px-5 py-2.5 text-base",
        size === "large" &&
          variant !== "text" &&
          "min-h-12 px-6 py-3 text-base",
        className,
      )}
      {...props}
    />
  );
}
