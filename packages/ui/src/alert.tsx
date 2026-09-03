import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./utils";

export interface AlertProps extends ComponentPropsWithoutRef<"div"> {
  readonly tone?: "error" | "warning" | "success" | "info";
  readonly title?: string;
}

const toneClassName: Record<NonNullable<AlertProps["tone"]>, string> = {
  error: "border-error/25 bg-error/5 text-error",
  warning: "border-warning/25 bg-warning/8 text-warning",
  success: "border-success/25 bg-success/8 text-success",
  info: "border-heritage-gold/40 bg-heritage-gold/10 text-global-navy",
};

export function Alert({
  children,
  className,
  role = "status",
  title,
  tone = "info",
  ...props
}: AlertProps) {
  return (
    <div
      role={role}
      className={cx(
        "rounded-card border p-4 leading-6",
        toneClassName[tone],
        className,
      )}
      {...props}
    >
      {title ? <p className="font-bold text-current">{title}</p> : null}
      <div className={title ? "mt-1 text-sm" : "text-sm"}>{children}</div>
    </div>
  );
}
