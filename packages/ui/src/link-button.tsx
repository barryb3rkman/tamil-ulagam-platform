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
        "rounded-button duration-standard focus-visible:ring-focus inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none",
        variant === "primary" && "bg-global-navy hover:bg-deep-navy text-white",
        variant === "secondary" &&
          "border-global-navy text-global-navy hover:bg-global-navy border bg-transparent hover:text-white",
        variant === "text" &&
          "text-global-navy decoration-heritage-gold hover:text-heritage-maroon rounded-none px-0 underline decoration-2 underline-offset-4",
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
