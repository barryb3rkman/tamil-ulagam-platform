import { forwardRef, type TextareaHTMLAttributes } from "react";

import { controlClassName } from "./input";
import { cx } from "./utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Bare textarea control — compose with `FormField`, matching `Input`. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cx(
          controlClassName,
          "min-h-36 resize-y leading-7",
          className,
        )}
        {...props}
      />
    );
  },
);
