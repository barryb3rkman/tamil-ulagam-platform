"use client";

import { useEffect, useRef } from "react";

export function ParticleField({
  className = "",
  count = 46,
  tone = "gold",
}: {
  readonly className?: string;
  readonly count?: number;
  readonly tone?: "gold" | "cool";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;

    type Mote = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      a: number;
      pulse: number;
    };
    let motes: Mote[] = [];

    const seed = () => {
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.5 + Math.random() * 1.9,
        // Slow upward drift with a touch of lateral wander.
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.05 + Math.random() * 0.16),
        a: 0.14 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const rgb = tone === "gold" ? "232, 189, 99" : "150, 178, 226";

    const draw = () => {
      if (!running) return;
      context.clearRect(0, 0, width, height);
      for (const mote of motes) {
        mote.x += mote.vx;
        mote.y += mote.vy;
        mote.pulse += 0.012;
        if (mote.y < -6) {
          mote.y = height + 6;
          mote.x = Math.random() * width;
        }
        if (mote.x < -6) mote.x = width + 6;
        if (mote.x > width + 6) mote.x = -6;

        const alpha = mote.a * (0.65 + 0.35 * Math.sin(mote.pulse));
        context.beginPath();
        context.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
        context.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        if (frame) cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        frame = requestAnimationFrame(draw);
      }
    };

    resize();
    frame = requestAnimationFrame(draw);

    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(resize)
        : undefined;
    observer?.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-motion-ambient
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  );
}
