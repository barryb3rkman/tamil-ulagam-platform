import { LinkButton } from "@tamil-ulagam/ui";

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly action?: {
    readonly label: string;
    readonly href: string;
  };
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="rounded-card border-global-navy/12 shadow-card border bg-white p-7 sm:p-9">
      <span
        aria-hidden="true"
        className="bg-heritage-gold mb-5 block h-1 w-14 rounded-full"
      />
      <h2 className="text-global-navy text-2xl font-semibold tracking-[-0.015em]">
        {title}
      </h2>
      <p className="text-slate mt-3 max-w-2xl leading-7">{description}</p>
      {action ? (
        <LinkButton className="mt-6" href={action.href} variant="secondary">
          {action.label}
        </LinkButton>
      ) : null}
    </div>
  );
}
