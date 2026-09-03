"use client";

import { useRef, useState } from "react";

import { BrandMark } from "@/components/brand/brand-mark";

export function TamilIdCard3D({
  memberName = "Tamil Ulagam Member",
  memberId = "TU · 0000 0000",
}: {
  readonly memberName?: string;
  readonly memberId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const element = ref.current;
    if (!element) return;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const rect = element.getBoundingClientRect();
    setTilt({
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const rotateY = (tilt?.x ?? 0) * 24;
  const rotateX = -(tilt?.y ?? 0) * 18;

  return (
    <div
      className="motion-pop relative w-full max-w-lg [perspective:1400px]"
      onPointerMove={handleMove}
      onPointerLeave={() => setTilt(null)}
    >
      <span
        aria-hidden="true"
        className="blob bg-vivid-maroon/25 pointer-events-none absolute -top-10 -right-6 size-64 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="blob-alt bg-heritage-gold/15 pointer-events-none absolute -bottom-12 -left-8 size-56 blur-3xl"
      />

      <div
        ref={ref}
        aria-hidden="true"
        className="ease-premium relative aspect-[1.586/1] w-full overflow-hidden rounded-[1.5rem] border border-white/15 shadow-[0_2.5rem_5rem_rgba(120,20,45,0.45)] transition-transform duration-300 [transform-style:preserve-3d] motion-reduce:!transform-none"
        style={{
          transform: `rotate3d(1, 0, 0, ${rotateX}deg) rotate3d(0, 1, 0, ${rotateY}deg)`,
          backgroundImage: [
            "linear-gradient(135deg,",
            "var(--tu-maroon-deep) 0%,",
            "var(--tu-maroon-mid) 42%,",
            "var(--tu-maroon-light) 68%,",
            "var(--tu-maroon-deep) 100%)",
          ].join(" "),
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-12 size-56 rounded-full border border-white/12"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -right-4 size-36 rounded-full border border-white/10"
        />
        <span
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: tilt ? 1 : 0,
            background: `radial-gradient(34rem 20rem at ${(tilt?.x ?? 0) * 100 + 50}% ${(tilt?.y ?? 0) * 100 + 50}%, rgba(255,244,214,0.28), transparent 62%)`,
          }}
        />
        <span className="gradient-gold-leaf pointer-events-none absolute inset-x-0 top-0 h-px opacity-80" />

        <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <BrandMark className="size-11 shrink-0" />
            <span className="text-[0.6rem] font-bold tracking-[0.24em] text-white/70 uppercase">
              Tamil ID
            </span>
          </div>
          <div>
            <p className="font-tamil text-sm text-white/70" lang="ta">
              தமிழ் உலகம்
            </p>
            <p className="font-display mt-1 text-2xl font-semibold text-white">
              {memberName}
            </p>
            <p className="mt-2 font-mono text-xs tracking-[0.2em] text-white/60">
              {memberId}
            </p>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="motion-pop border-global-navy/[0.09] absolute -top-6 -left-4 hidden rounded-2xl border bg-white px-4 py-3 shadow-[0_1rem_2.5rem_rgba(6,29,50,0.14)] sm:block"
      >
        <p className="text-slate text-eyebrow-sm">One identity</p>
        <p className="text-global-navy font-display mt-1 text-lg font-semibold">
          Every workspace
        </p>
      </div>
      <div
        aria-hidden="true"
        className="motion-pop border-global-navy/[0.09] absolute -right-4 -bottom-7 hidden rounded-2xl border bg-white px-4 py-3 shadow-[0_1rem_2.5rem_rgba(6,29,50,0.14)] [animation-delay:220ms] sm:block"
      >
        <p className="text-slate text-eyebrow-sm">Verified by</p>
        <p className="text-global-navy font-display mt-1 text-lg font-semibold">
          The federation
        </p>
      </div>
    </div>
  );
}
