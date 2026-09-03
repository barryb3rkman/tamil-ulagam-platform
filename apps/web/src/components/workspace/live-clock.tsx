"use client";

import { useSyncExternalStore } from "react";

export function LiveClock({ updatedAt }: { readonly updatedAt?: number }) {
  const now = useSyncExternalStore(subscribeToSecond, getNow, getNoNow);

  if (!now) {
    // Reserve the row so the masthead does not shift when time arrives.
    return <div aria-hidden="true" className="h-[3.25rem]" />;
  }

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const seconds = new Intl.DateTimeFormat(undefined, {
    second: "2-digit",
  }).format(now);
  const day = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden="true"
        className="bg-heritage-gold/70 hidden h-10 w-px sm:block"
      />
      <div className="text-right">
        <p className="font-display flex items-baseline justify-end gap-1 text-2xl leading-none font-semibold text-white/92 tabular-nums">
          {time}
          <span className="text-heritage-gold/70 text-sm tabular-nums">
            {seconds}
          </span>
        </p>
        <p className="text-eyebrow-sm mt-1.5 text-white/40">{day}</p>
        {updatedAt ? (
          <p className="mt-1 flex items-center justify-end gap-1.5 text-[0.68rem] text-white/35">
            <span
              aria-hidden="true"
              className="bg-success inline-block size-1.5 animate-pulse rounded-full"
            />
            {describeFreshness(now.getTime() - updatedAt)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function describeFreshness(elapsedMs: number): string {
  const seconds = Math.max(0, Math.round(elapsedMs / 1000));
  if (seconds < 45) return "Live";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `Updated ${hours}h ago`;
}

let currentSecond: Date | null = null;
const listeners = new Set<() => void>();
let timer: number | undefined;

function subscribeToSecond(onChange: () => void): () => void {
  listeners.add(onChange);
  if (timer === undefined) {
    currentSecond = new Date();
    timer = window.setInterval(() => {
      currentSecond = new Date();
      for (const listener of listeners) listener();
    }, 1000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
      currentSecond = null;
    }
  };
}

function getNow(): Date | null {
  return currentSecond;
}

function getNoNow(): Date | null {
  return null;
}
