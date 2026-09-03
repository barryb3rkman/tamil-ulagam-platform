import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cx } from "./utils";

type SurfaceElement = "div" | "section" | "article" | "aside";

export type SurfaceLevel = "canvas" | "card" | "elevated" | "deep";
export type SurfaceDensity = "comfortable" | "compact";

export interface SurfaceProps<TElement extends SurfaceElement = "div"> {
  readonly as?: TElement;
  readonly level?: SurfaceLevel;
  readonly density?: SurfaceDensity;
  readonly glass?: boolean;
}

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
