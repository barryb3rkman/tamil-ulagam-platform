"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const field = document.querySelector<HTMLElement>(".night-field");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number | undefined;
    const paint = () => {
      frame = undefined;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable < 240) {
        bar.style.opacity = "0";
        field?.style.setProperty("--tu-scroll", "0");
        return;
      }
      bar.style.opacity = "1";
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
      // Published for the night field, which is fixed and would otherwise show
      // the same crop of itself from the top of the page to the bottom. One
      // listener, already throttled to a frame, rather than a second one.
      //
      // Written on the field, never on the document element. A custom property
      // set on the root invalidates style for the whole document on every
      // scrolled frame; that recalculation was re-firing section reveals
      // mid-scroll, which put a transform back on a section that had already
      // finished animating. The field's subtree is three empty divs, so
      // scoping the write there costs nothing to invalidate.
      field?.style.setProperty("--tu-scroll", progress.toFixed(4));
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
