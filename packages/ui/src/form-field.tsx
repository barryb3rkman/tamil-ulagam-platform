import type { ReactNode } from "react";

export interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly helperText?: string;
  readonly error?: string;
  readonly children: ReactNode;
}

/**
 * Label + description/error wrapper shared by every form primitive
 * below. A generic composition primitive: it renders the label (tied to
 * `id` via `htmlFor`) and, when there's an error or helper text, a
 * description paragraph at `descriptionId(id)`. Deliberately does not
 * reach into `children` to auto-wire `aria-describedby`/`aria-invalid`
 * onto the control — that would mean either cloning children (fragile,
 * type-unsafe) or a context bridge (hidden behaviour this design system
 * explicitly avoids). Wire it explicitly instead:
 *
 *   <FormField id={id} label="Name" error={error}>
 *     <Input
 *       id={id}
 *       aria-invalid={Boolean(error)}
 *       aria-describedby={error ? descriptionId(id) : undefined}
 *     />
 *   </FormField>
 */
export function FormField({
  children,
  error,
  helperText,
  id,
  label,
  required,
}: FormFieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-label text-global-navy">
        {label}
        {required ? (
          <>
            <span className="text-heritage-maroon ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={descriptionId(id)} role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : helperText ? (
        <p id={descriptionId(id)} className="text-slate text-sm">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

/** The description/error paragraph id a given field id resolves to —
 * exported so Input/Textarea/Select/etc. can wire `aria-describedby`
 * without either component needing to know the other's internals. */
export function descriptionId(fieldId: string): string {
  return `${fieldId}-description`;
}
