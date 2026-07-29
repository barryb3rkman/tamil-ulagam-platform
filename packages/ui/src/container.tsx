import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cx } from "./utils";

type ContainerElement = "div" | "section";

export interface ContainerProps<TElement extends ContainerElement = "div"> {
  readonly as?: TElement;
  readonly size?: "standard" | "wide" | "narrow";
}

export function Container<TElement extends ContainerElement = "div">({
  as,
  className,
  size = "standard",
  ...props
}: ContainerProps<TElement> &
  Omit<ComponentPropsWithoutRef<TElement>, keyof ContainerProps<TElement>>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={cx(
        "mx-auto w-full px-5 sm:px-8 lg:px-10",
        size === "narrow" && "max-w-container-narrow",
        size === "standard" && "max-w-container",
        size === "wide" && "max-w-container-wide",
        className,
      )}
      {...props}
    />
  );
}
