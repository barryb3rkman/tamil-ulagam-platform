import type { ReactNode } from "react";

export interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly helperText?: string;
  readonly error?: string;
  readonly children: ReactNode;
}

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

export function descriptionId(fieldId: string): string {
  return `${fieldId}-description`;
}
