import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cx } from "./utils";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  readonly id: string;
  readonly label: ReactNode;
  readonly description?: string;
  readonly error?: string;
}

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
            "border-hairline/15 focus-within:ring-focus rounded-button bg-raised flex min-h-12 cursor-pointer items-start gap-3 border px-4 py-3",
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
            <span className="text-fg-body block text-sm font-semibold">
              {label}
            </span>
            {description ? (
              <span className="text-fg-muted mt-1 block text-sm">
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
