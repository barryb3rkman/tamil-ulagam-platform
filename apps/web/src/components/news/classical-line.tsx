"use client";

import { useEffect, useRef, useState } from "react";

import { newsContent } from "@/content/news";

const HOLD_MS = 9_000;

/**
 * Classical Tamil, turning over.
 *
 * The lines are Purananuru, Thirukkural and Bharathidasan — out of copyright
 * by centuries, and the first is the one the federation's own presentation
 * closes on. It is the piece of this site whose content is genuinely two
 * thousand years old, so it gets the room to be read rather than a ticker.
 *
 * Nine seconds a line, and it stops entirely under reduced motion: a reader
 * who has asked for stillness should not have text changing under them.
 */
export function ClassicalLine() {
  const [index, setIndex] = useState(0);
  const [entering, setEntering] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // jsdom has no matchMedia; the rest of the motion code guards it the
    // same way rather than mocking it in the test setup.
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const advance = window.setInterval(() => {
      setEntering(true);
      setIndex((current) => (current + 1) % newsContent.classicalLines.length);
      // Long enough for the entrance to play out, short enough that it is
      // never still running when the next line is due.
      const settle = window.setTimeout(() => setEntering(false), 900);
      timers.current.push(settle);
    }, HOLD_MS);

    return () => {
      window.clearInterval(advance);
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
    };
  }, []);

  const line = newsContent.classicalLines[index];
  if (!line) return null;

  return (
    <section
      aria-labelledby="classical-line-title"
      className="classical-line relative isolate overflow-hidden py-16 sm:py-20"
    >
      <h2 id="classical-line-title" className="sr-only">
        From classical Tamil
      </h2>
      <span aria-hidden="true" className="classical-line-glow" />

      <div className="relative mx-auto w-full max-w-[52rem] px-5 text-center sm:px-8">
        <div
          key={index}
          data-entering={entering ? "true" : undefined}
          className="classical-line-body"
          aria-live="off"
        >
          <p
            className="font-tamil text-gradient-gold text-2xl leading-[1.7] whitespace-pre-line sm:text-4xl sm:leading-[1.6]"
            lang="ta"
          >
            {line.tamil}
          </p>
          <p className="mt-6 text-lg leading-8 text-white/75 sm:text-xl">
            {line.english}
          </p>
          <p className="text-heritage-gold/70 mt-5 text-xs font-bold tracking-[0.2em] uppercase">
            {line.source}
          </p>
        </div>

        <ul
          aria-hidden="true"
          className="mt-9 flex items-center justify-center gap-2"
        >
          {newsContent.classicalLines.map((item, position) => (
            <li
              key={item.tamil}
              data-active={position === index ? "true" : undefined}
              className="classical-line-dot"
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
