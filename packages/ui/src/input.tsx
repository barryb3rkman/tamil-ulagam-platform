import { forwardRef, type InputHTMLAttributes } from "react";

import { cx } from "./utils";

// placeholder:text-slate/90 (not the default full-strength text-slate):
// placeholder copy is intentionally a touch lighter than real input value
// text, but /65 blended too far toward the page background to clear AA
// (4.5:1) — /90 keeps that lighter feel while measuring 4.7-5.1:1 against
// the warm-ivory/white surfaces this control actually sits on.
export const controlClassName =
  "motion-control focus-visible:ring-focus border-global-navy/20 bg-warm-ivory/20 text-charcoal placeholder:text-slate/90 hover:border-global-navy/35 min-h-12 w-full rounded-button border px-4 py-2.5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus-visible:border-interactive-blue focus-visible:bg-white focus-visible:outline-none aria-[invalid=true]:border-error aria-[invalid=true]:bg-error/3 disabled:bg-global-navy/5 disabled:cursor-not-allowed disabled:text-slate";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * Bare text-input control — no label, no error text. Compose with
 * `FormField` for a labelled field, wiring `aria-describedby` via the
 * exported `descriptionId` helper whenever there's an error or helper
 * text to announce:
 *
 *   <FormField id={id} label="Name" error={error}>
 *     <Input
 *       id={id}
 *       aria-invalid={Boolean(error)}
 *       aria-describedby={error ? descriptionId(id) : undefined}
 *     />
 *   </FormField>
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input ref={ref} className={cx(controlClassName, className)} {...props} />
  );
});
