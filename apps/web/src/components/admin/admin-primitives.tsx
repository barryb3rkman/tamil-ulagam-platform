import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-slate text-[0.66rem] font-bold tracking-[0.18em] uppercase">
          {eyebrow}
        </p>
        <h1 className="text-page-title text-gradient-ink mt-2">{title}</h1>
        <p className="text-slate mt-3 max-w-3xl leading-7">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <section className="border-global-navy/12 rounded-card border bg-white p-7 text-center sm:p-10">
      <h2 className="text-global-navy text-xl font-bold">{title}</h2>
      <p className="text-slate mx-auto mt-2 max-w-xl leading-7">
        {description}
      </p>
    </section>
  );
}

export function AdminLoadingState({ label }: { readonly label: string }) {
  return (
    <div role="status" className="grid gap-3 py-8" aria-label={label}>
      <div className="bg-global-navy/8 h-4 w-40 animate-pulse rounded" />
      <div className="bg-global-navy/8 h-20 w-full animate-pulse rounded" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function AdminErrorState({ message }: { readonly message: string }) {
  return (
    <div
      role="alert"
      className="border-error/25 bg-error/5 text-error rounded-card border p-5 leading-7"
    >
      {message}
    </div>
  );
}
