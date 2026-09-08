import { forwardRef, type InputHTMLAttributes } from "react";

import { cx } from "./utils";

export const controlClassName =
  "motion-control focus-visible:ring-focus border-hairline/20 bg-sunken/20 text-fg-body placeholder:text-fg-muted/90 hover:border-hairline/35 min-h-12 w-full rounded-button border px-4 py-2.5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus-visible:border-interactive-blue focus-visible:bg-raised focus-visible:outline-none aria-[invalid=true]:border-error aria-[invalid=true]:bg-error/3 disabled:bg-global-navy/5 disabled:cursor-not-allowed disabled:text-fg-muted";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input ref={ref} className={cx(controlClassName, className)} {...props} />
  );
});
