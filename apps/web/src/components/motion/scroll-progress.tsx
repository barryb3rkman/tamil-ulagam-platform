"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number | undefined;
    const paint = () => {
      frame = undefined;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable < 240) {
        bar.style.opacity = "0";
        return;
      }
      bar.style.opacity = "1";
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    };
    const onScroll = () => {
      if (frame !== undefined) return;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        ref={barRef}
        className="gradient-gold-leaf h-full origin-left opacity-0"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
