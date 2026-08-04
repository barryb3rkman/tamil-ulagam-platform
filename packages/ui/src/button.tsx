import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cx } from "./utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "ghost";
  readonly size?: "small" | "medium" | "large";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      size = "medium",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cx(
          "motion-control rounded-button focus-visible:ring-focus inline-flex items-center justify-center font-semibold focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55",
          variant === "primary" &&
            "bg-global-navy hover:bg-deep-navy text-white",
          variant === "secondary" &&
            "border-global-navy text-global-navy hover:bg-global-navy border bg-transparent hover:text-white",
          variant === "ghost" &&
            "text-global-navy hover:bg-global-navy/8 bg-transparent",
          size === "small" && "min-h-10 px-4 py-2 text-sm",
          size === "medium" && "min-h-11 px-5 py-2.5 text-base",
          size === "large" && "min-h-12 px-6 py-3 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);
