"use client";

import { Button } from "@tamil-ulagam/ui";
import type {
  ChangeEventHandler,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";

// placeholder:text-slate/90 — see packages/ui/src/input.tsx's
// controlClassName for why /65 was replaced (AA contrast). min-h-11
// (44px) rather than packages/ui/Input's min-h-12 — H2 brief: normal
// one-line fields shouldn't look like textareas; 44px is still a full
// touch target, just less oversized on desktop-dense forms.
const controlClass =
  "motion-control focus-visible:ring-focus border-global-navy/20 bg-warm-ivory/20 text-charcoal placeholder:text-slate/90 hover:border-global-navy/35 min-h-11 w-full rounded-button border px-4 py-2 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] focus-visible:border-interactive-blue focus-visible:bg-white focus-visible:outline-none aria-[invalid=true]:border-error aria-[invalid=true]:bg-error/3 disabled:bg-global-navy/5 disabled:cursor-not-allowed disabled:text-slate";

interface FieldFrameProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly helperText?: string;
  readonly error?: string;
  readonly children: ReactNode;
}

// One platform-wide optional-field convention (H2 brief sections 2/9):
// the qualifier lives in the label itself, muted, never as a standalone
// "Optional." helper line. A field is optional whenever the caller
// doesn't pass `required` — every call site in this codebase already
// marks genuinely-required fields with `required`, so this is a safe,
// single source of truth rather than a second flag to keep in sync.
function FieldFrame({
  children,
  error,
  helperText,
  id,
  label,
  required,
}: FieldFrameProps) {
  const descriptionId = `${id}-description`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-global-navy text-sm font-semibold">
        {label}
        {required ? (
          <>
            <span className="text-heritage-maroon ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : (
          <span className="text-slate ml-1.5 text-xs font-normal">
            {" "}
            (optional)
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={descriptionId} role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-slate max-w-md text-xs leading-5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> {
  readonly id?: string;
  readonly label: string;
  readonly helperText?: string;
  readonly error?: string;
}

export function TextField({
  error,
  helperText,
  id: providedId,
  label,
  maxLength = 200,
  required,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <FieldFrame
      id={id}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
    >
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${id}-description` : undefined}
        className={controlClass}
        maxLength={maxLength}
        {...props}
      />
    </FieldFrame>
  );
}

export interface TextareaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> {
  readonly id?: string;
  readonly label: string;
  readonly helperText?: string;
  readonly error?: string;
}

export function TextareaField({
  error,
  helperText,
  id: providedId,
  label,
  maxLength = 1200,
  required,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <FieldFrame
      id={id}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
    >
      <textarea
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${id}-description` : undefined}
        className={`${controlClass} min-h-36 resize-y leading-7`}
        maxLength={maxLength}
        {...props}
      />
    </FieldFrame>
  );
}

export interface SelectFieldProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id"
> {
  readonly id?: string;
  readonly label: string;
  readonly helperText?: string;
  readonly error?: string;
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
  }[];
  readonly placeholder?: string;
}

export function SelectField({
  error,
  helperText,
  id: providedId,
  label,
  options,
  placeholder = "Select an option",
  required,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <FieldFrame
      id={id}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
    >
      <select
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${id}-description` : undefined}
        className={controlClass}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

export interface CheckboxFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "type"
> {
  readonly id?: string;
  readonly label: string;
  readonly description?: string;
  readonly error?: string;
}

export function CheckboxField({
  description,
  error,
  id: providedId,
  label,
  ...props
}: CheckboxFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="border-global-navy/15 focus-within:ring-focus rounded-button flex min-h-12 cursor-pointer items-start gap-3 border bg-white px-4 py-3"
      >
        <input
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
            <span className="text-slate mt-1 block text-sm">{description}</span>
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
}

interface RadioGroupProps {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly options: readonly {
    readonly value: string;
    readonly label: string;
  }[];
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly error?: string;
  readonly required?: boolean;
}

export function RadioGroup({
  error,
  label,
  name,
  onChange,
  options,
  required,
  value,
}: RadioGroupProps) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-global-navy text-sm font-semibold">
        {label}
        {required ? (
          <>
            <span className="text-heritage-maroon ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`motion-control focus-within:ring-focus rounded-button flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 ${value === option.value ? "border-heritage-maroon bg-heritage-maroon/5" : "border-global-navy/15 hover:border-global-navy/30 bg-white"}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="accent-heritage-maroon size-5 shrink-0"
            />
            <span className="text-sm font-medium">{option.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

interface MultiSelectProps {
  readonly label: string;
  readonly options: readonly string[];
  readonly value: readonly string[];
  readonly onChange: (value: string[]) => void;
  readonly required?: boolean;
  readonly error?: string;
}

export function MultiSelect({
  error,
  label,
  onChange,
  options,
  required,
  value,
}: MultiSelectProps) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-global-navy text-sm font-semibold">
        {label}
        {required ? (
          <>
            <span className="text-heritage-maroon ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <label
            key={option}
            className={`motion-control focus-within:ring-focus relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium ${value.includes(option) ? "border-global-navy bg-global-navy text-white shadow-sm" : "border-global-navy/15 text-charcoal hover:border-global-navy/35 bg-white"}`}
          >
            <input
              type="checkbox"
              value={option}
              checked={value.includes(option)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...value, option]
                    : value.filter((item) => item !== option),
                )
              }
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
            />
            {value.includes(option) ? (
              <span aria-hidden="true" className="text-heritage-gold font-bold">
                ✓
              </span>
            ) : null}
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-error text-sm">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function FormSection({
  children,
  description,
  title,
}: {
  readonly children: ReactNode;
  readonly description?: string;
  readonly title: string;
}) {
  return (
    <section className="border-global-navy/12 rounded-large shadow-card border bg-white p-5 sm:p-7 lg:p-8">
      <div className="mb-6 max-w-2xl">
        <h2 className="text-global-navy text-xl font-bold tracking-[-0.015em] sm:text-2xl">
          {title}
        </h2>
        {description ? <p className="text-slate mt-2">{description}</p> : null}
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

export function FormSubsection({
  children,
  description,
  title,
}: {
  readonly children: ReactNode;
  readonly description?: string;
  readonly title: string;
}) {
  return (
    <fieldset className="border-global-navy/10 bg-warm-ivory/35 rounded-card border p-5 sm:p-6">
      <legend className="text-global-navy px-2 text-base font-bold">
        {title}
      </legend>
      {description ? (
        <p className="text-slate mb-5 text-sm leading-6">{description}</p>
      ) : null}
      <div className="grid gap-5">{children}</div>
    </fieldset>
  );
}

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

function AutosaveIndicator({
  status,
  onRetry,
}: {
  readonly status: AutosaveStatus;
  readonly onRetry?: () => void;
}) {
  if (status === "idle") return <span aria-live="polite" className="sr-only" />;
  return (
    <p
      aria-live="polite"
      className="text-slate flex items-center gap-1.5 text-xs font-medium"
    >
      {status === "saving" ? (
        <>
          <span
            aria-hidden="true"
            className="border-slate/40 border-t-slate size-3 animate-spin rounded-full border-2"
          />
          Saving…
        </>
      ) : status === "saved" ? (
        <>
          <span aria-hidden="true" className="text-success">
            ✓
          </span>
          Saved
        </>
      ) : (
        <span className="text-error flex items-center gap-2">
          Progress couldn&apos;t be saved.
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="focus-visible:ring-focus rounded-sm font-semibold underline underline-offset-2 focus-visible:outline-none"
            >
              Retry
            </button>
          ) : null}
        </span>
      )}
    </p>
  );
}

// Deliberately not a card (H2 brief section 17/19 — the wizard footer
// shouldn't read as its own dashboard surface): a slim, top-bordered row
// that anchors the page without a large white container. Registration
// autosaves (section 13) — there is no explicit "Save progress" action
// any more, only a quiet save-status readout next to Continue.
export function FormActions({
  backLabel = "Back",
  nextLabel = "Continue",
  onBack,
  onRetry,
  pending,
  saveStatus = "idle",
}: {
  readonly backLabel?: string;
  readonly nextLabel?: string;
  readonly onBack?: () => void;
  readonly onRetry?: () => void;
  readonly pending?: boolean;
  readonly saveStatus?: AutosaveStatus;
}) {
  return (
    <div className="border-global-navy/12 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full sm:w-auto"
        >
          {backLabel}
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
        <AutosaveIndicator status={saveStatus} onRetry={onRetry} />
        <Button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="w-full sm:w-auto"
        >
          {pending ? "Saving…" : nextLabel}
        </Button>
      </div>
    </div>
  );
}

export function FormError({ message }: { readonly message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="border-error/25 bg-error/5 text-error rounded-button border px-4 py-3 text-sm"
    >
      {message}
    </div>
  );
}
