import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export interface SectionHeadingProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "title"
> {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly align?: "left" | "center";
  readonly tone?: "ink" | "inverse";
  readonly headingLevel?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  align = "left",
  className,
  description,
  eyebrow,
  headingLevel = "h2",
  title,
  tone = "ink",
  ...props
}: SectionHeadingProps) {
  const Heading = headingLevel;

  return (
    <div
      data-motion-rule="heading"
      className={cx(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
      {...props}
    >
      {eyebrow ? (
        <p
          className={cx(
            "mb-3 text-sm font-semibold tracking-[0.14em] uppercase",
            tone === "inverse" ? "text-heritage-gold" : "text-heritage-maroon",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={cx(
          "font-english text-4xl leading-tight font-semibold tracking-[-0.025em] text-balance sm:text-5xl",
          tone === "inverse" ? "text-white" : "text-gradient-ink",
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p className="text-slate mt-5 text-lg leading-8">{description}</p>
      ) : null}
    </div>
  );
}
