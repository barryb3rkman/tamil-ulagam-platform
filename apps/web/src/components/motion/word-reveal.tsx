"use client";

import { Fragment } from "react";

/**
 * Splits a heading into words and lets each one rise out of its own line box,
 * a fraction of a second after the one before it. The double span is what
 * makes the effect work: the outer one clips, the inner one moves.
 *
 * Reads as ordinary text to a screen reader, because it is — only the
 * presentation is cut up.
 */
export function WordReveal({
  className = "",
  delay = 0,
  stagger = 70,
  text,
}: {
  readonly className?: string;
  readonly delay?: number;
  readonly stagger?: number;
  readonly text: string;
}) {
  const words = text.split(" ").filter(Boolean);

  return (
    <span className={`text-rise ${className}`}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${String(index)}`}>
          <span>
            <span
              style={
                {
                  "--tu-stagger": `${String(delay + index * stagger)}ms`,
                  "--tu-word-index": index,
                } as React.CSSProperties
              }
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
