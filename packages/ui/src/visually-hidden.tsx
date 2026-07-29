import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export function VisuallyHidden({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return <span className={cx("sr-only", className)} {...props} />;
}
