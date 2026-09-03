import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { ParticleField } from "@/components/motion/particle-field";

export function JourneyMasthead({
  align = "center",
  children,
  compact = false,
  description,
  eyebrow,
  headingId,
  title,
}: {
  readonly align?: "center" | "start";
  readonly children?: ReactNode;
  readonly compact?: boolean;
  readonly description?: string;
  readonly eyebrow: string;
  readonly headingId?: string;
  readonly title: string;
}) {
  const centered = align === "center";
  return (
    <div className="gradient-aurora relative isolate overflow-hidden">
      <ParticleField count={compact ? 30 : 44} />
      <div
        aria-hidden="true"
        data-motion-ambient
        className={`bg-heritage-gold/12 motion-float pointer-events-none absolute size-72 rounded-full blur-3xl ${
          centered ? "-top-28 right-1/4" : "-top-24 -right-16"
        }`}
      />

      <div
        className={`relative mx-auto max-w-[74rem] px-5 sm:px-7 lg:px-10 ${
          compact ? "py-10 sm:py-12" : "py-16 sm:py-20 lg:py-24"
        }`}
      >
        <div
          data-motion-reveal=""
          className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}
        >
          <div
            className={`relative grid place-items-center ${
              centered ? "mx-auto" : ""
            } ${compact ? "size-14" : "size-24"}`}
          >
            <span
              aria-hidden="true"
              data-motion-ambient
              className={`bg-heritage-gold/25 motion-halo absolute rounded-full blur-3xl ${
                compact ? "size-16" : "size-28"
              }`}
            />
            <BrandMark
              orbit={!compact}
              className={`relative ${compact ? "size-14" : "size-24"}`}
            />
          </div>
          <p
            className={`text-heritage-gold/85 text-[0.68rem] font-bold tracking-[0.24em] uppercase ${
              compact ? "mt-5" : "mt-7"
            }`}
          >
            {eyebrow}
          </p>
          <h1
            id={headingId}
            className={`text-gradient-gold mt-3 text-balance ${
              compact ? "text-page-title" : "text-display"
            }`}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={`mt-5 leading-8 text-white/65 ${
                centered ? "mx-auto max-w-lg text-lg" : "max-w-xl text-lg"
              }`}
            >
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div className="relative mt-9">{children}</div> : null}
      </div>
    </div>
  );
}
