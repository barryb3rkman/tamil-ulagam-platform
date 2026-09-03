import { BrandMark } from "@/components/brand/brand-mark";

export function RouteLoading({
  label = "Loading…",
}: {
  readonly label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="surface-page grid min-h-[60vh] place-items-center px-6 py-20"
    >
      <div className="relative grid place-items-center gap-5 text-center">
        <span
          aria-hidden="true"
          data-motion-ambient
          className="bg-heritage-gold/18 motion-halo absolute size-36 rounded-full blur-3xl"
        />
        <BrandMark orbit className="relative size-16" />
        <span className="text-slate relative text-[0.7rem] font-bold tracking-[0.22em] uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
