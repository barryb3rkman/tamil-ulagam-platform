import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  readonly tone?: "ivory" | "white" | "navy";
  readonly spacing?: "compact" | "standard" | "generous";
  readonly motion?: "reveal" | "static";
}

export function Section({
  className,
  motion = "reveal",
  spacing = "standard",
  tone = "ivory",
  ...props
}: SectionProps) {
  return (
    <section
      data-motion-reveal={motion === "reveal" ? "section" : undefined}
      className={cx(
        // No fill of its own: ivory is the page's own colour, and painting it
        // again here is what hid the ambient field behind every section and
        // left the site reading as one flat block of cream.
        tone === "ivory" && "text-charcoal",
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
