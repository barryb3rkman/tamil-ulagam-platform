import type { ChangeEventHandler } from "react";

export interface RadioOption {
  readonly value: string;
  readonly label: string;
}

export interface RadioGroupProps {
  readonly label: string;
  readonly name: string;
  readonly value: string;
  readonly options: readonly RadioOption[];
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly error?: string;
  readonly required?: boolean;
}

/** A fieldset of mutually-exclusive options — self-contained, matching
 * `Checkbox`, since a radio option's label is intrinsic to it. */
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
      <legend className="text-label text-global-navy">
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
