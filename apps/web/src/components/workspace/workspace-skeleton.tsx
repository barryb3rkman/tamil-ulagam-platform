import { Container, Skeleton } from "@tamil-ulagam/ui";

export function WorkspaceSkeleton({
  label = "Loading your workspace",
  panels = 3,
  stats = 3,
}: {
  readonly label?: string;
  readonly panels?: number;
  readonly stats?: number;
}) {
  return (
    <Container
      size="wide"
      role="status"
      aria-label={label}
      className="py-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10"
    >
      <div className="gradient-aurora rounded-large glow-ring relative isolate overflow-hidden px-6 pt-8 pb-7 sm:px-9 sm:pt-11 sm:pb-9">
        <div className="flex flex-wrap items-start justify-between gap-7">
          <div className="flex min-w-0 items-start gap-4">
            <Skeleton shape="circle" className="size-14 shrink-0 bg-white/10" />
            <div className="min-w-0 space-y-3">
              <Skeleton shape="text" className="h-3 w-32 bg-white/10" />
              <Skeleton shape="text" className="h-8 w-64 bg-white/12" />
              <Skeleton shape="text" className="h-3 w-40 bg-white/8" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 bg-white/12" />
            <Skeleton className="h-11 w-32 bg-white/8" />
          </div>
        </div>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: stats }, (_, index) => (
            <Skeleton key={index} className="h-24 bg-white/6" />
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-3">
        <Skeleton shape="text" className="h-6 w-56" />
        <Skeleton shape="text" className="h-3 w-96 max-w-full" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {Array.from({ length: panels }, (_, index) => (
          <Skeleton key={index} className="h-48" />
        ))}
      </div>
    </Container>
  );
}

export function ListSkeleton({
  label = "Loading",
  rows = 4,
}: {
  readonly label?: string;
  readonly rows?: number;
}) {
  return (
    <Container
      size="wide"
      role="status"
      aria-label={label}
      className="py-6 sm:py-8 lg:px-8 lg:py-9 xl:px-10"
    >
      <div className="space-y-3">
        <Skeleton shape="text" className="h-3 w-28" />
        <Skeleton shape="text" className="h-8 w-72 max-w-full" />
      </div>
      <div className="mt-8 grid gap-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
    </Container>
  );
}
