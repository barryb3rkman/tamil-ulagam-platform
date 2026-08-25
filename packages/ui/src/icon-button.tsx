import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cx } from "./utils";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required — an icon-only button must always have an accessible
   * name; there is no visible text to fall back on. */
  readonly "aria-label": string;
  readonly variant?: "ghost" | "solid";
}

/**
 * A minimal icon-only button, kept deliberately small in scope — built
 * because Dialog/Sheet close controls need one, not as a general
 * do-everything icon-button variant system.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className, type = "button", variant = "ghost", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cx(
          "motion-control focus-visible:ring-focus grid size-10 shrink-0 place-items-center rounded-full focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55",
          variant === "ghost" &&
            "text-global-navy hover:bg-global-navy/8 bg-transparent",
          variant === "solid" && "bg-global-navy hover:bg-deep-navy text-white",
          className,
        )}
        {...props}
      />
    );
  },
);
