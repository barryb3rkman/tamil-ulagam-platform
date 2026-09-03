import { forwardRef, type SelectHTMLAttributes } from "react";

import { controlClassName } from "./input";
import { cx } from "./utils";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { className, options, placeholder = "Select an option", ...props },
    ref,
  ) {
    return (
      <select ref={ref} className={cx(controlClassName, className)} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);
