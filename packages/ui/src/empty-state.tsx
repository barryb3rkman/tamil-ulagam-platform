import type { ReactNode } from "react";

export interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={`surface-card grid justify-items-center gap-3 p-8 text-center sm:p-10 ${className ?? ""}`}
    >
      {icon ? (
        <div aria-hidden="true" className="text-heritage-gold">
          {icon}
        </div>
      ) : null}
      <p className="text-global-navy text-lg font-bold">{title}</p>
      {description ? (
        <p className="text-slate max-w-sm text-sm leading-6">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
