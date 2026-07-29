import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  readonly tone?: "ivory" | "white" | "navy";
  readonly spacing?: "compact" | "standard" | "generous";
}

export function Section({
  className,
  spacing = "standard",
  tone = "ivory",
  ...props
}: SectionProps) {
  return (
    <section
      className={cx(
        tone === "ivory" && "bg-warm-ivory text-charcoal",
        tone === "white" && "text-charcoal bg-white",
        tone === "navy" && "bg-global-navy text-white",
        spacing === "compact" && "py-section-compact",
        spacing === "standard" && "py-section",
        spacing === "generous" && "py-section-generous",
        className,
      )}
      {...props}
    />
  );
}
