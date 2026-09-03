import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cx } from "./utils";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly "aria-label": string;
  readonly variant?: "ghost" | "solid";
}

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
