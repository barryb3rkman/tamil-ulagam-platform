import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cx } from "./utils";

type SurfaceElement = "div" | "section" | "article" | "aside";

export type SurfaceLevel = "canvas" | "card" | "elevated" | "deep";
export type SurfaceDensity = "comfortable" | "compact";

export interface SurfaceProps<TElement extends SurfaceElement = "div"> {
  readonly as?: TElement;
  /**
   * One of the four design-system surfaces. `elevated` is reserved for
   * the single primary action area a screen has — using it more than
   * once per screen defeats the purpose of it reading as elevated.
   */
  readonly level?: SurfaceLevel;
  /** Applies padding/gap only when the surface also has inner spacing
   * needs (a card-shaped container) — omit for a bare background/tint
   * use (e.g. a page-level canvas wrapper). */
  readonly density?: SurfaceDensity;
  /** Layers the constrained glass treatment over a `deep` surface. */
  readonly glass?: boolean;
}

/**
 * The four design-system surfaces (canvas / card / elevated / deep),
 * plus the constrained glass variant that may only be layered over
 * `deep`. This is a generic visual primitive — it carries no Tamil
 * Ulagam domain knowledge and composes with any content.
 */
export function Surface<TElement extends SurfaceElement = "div">({
  as,
  className,
  density,
  glass = false,
  level = "card",
  ...props
}: SurfaceProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof SurfaceProps<TElement>>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      data-surface={level}
      className={cx(
        level === "canvas" && "surface-canvas",
        level === "card" && "surface-card",
        level === "elevated" && "surface-elevated",
        level === "deep" && "surface-deep",
        glass && level === "deep" && "surface-glass",
        density === "comfortable" && "density-comfortable",
        density === "compact" && "density-compact",
        className,
      )}
      {...props}
    />
  );
}
