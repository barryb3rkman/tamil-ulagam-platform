import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cx } from "./utils";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  readonly id: string;
  /** Accepts a ReactNode (not just a string) so a caller can embed an
   * inline link inside the label — a common real need (Terms of Use /
   * Privacy Policy consent) that a plain-string label can't express. */
  readonly label: ReactNode;
  readonly description?: string;
  readonly error?: string;
}

/**
 * A single labelled checkbox row — the label is intrinsic to a
 * checkbox (clicking it toggles the control), so unlike Input/Textarea/
 * Select this is a self-contained primitive rather than something you
 * compose with `FormField`.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { className, description, error, id, label, ...props },
    ref,
  ) {
    return (
      <div className="grid gap-2">
        <label
          htmlFor={id}
          className={cx(
            "border-global-navy/15 focus-within:ring-focus rounded-button flex min-h-12 cursor-pointer items-start gap-3 border bg-white px-4 py-3",
            className,
          )}
        >
          <input
            ref={ref}
            id={id}
            type="checkbox"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="accent-heritage-maroon mt-0.5 size-5 shrink-0"
            {...props}
          />
          <span>
            <span className="text-charcoal block text-sm font-semibold">
              {label}
            </span>
            {description ? (
              <span className="text-slate mt-1 block text-sm">
                {description}
              </span>
            ) : null}
          </span>
        </label>
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-error text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
