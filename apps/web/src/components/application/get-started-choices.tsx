"use client";

import Link from "next/link";

import { joinJourneys } from "@/content/join";

/**
 * The paths a brand-new account can take. Partnership is left out: it is an
 * enquiry form for institutions, not something an individual account holder
 * starts from here, and offering it alongside the three registration
 * journeys made the choice read as four equal options when it is three.
 */
const startableJourneys = joinJourneys.filter(
  (journey) => journey.id !== "partner",
);

export function GetStartedChoices({
  heading = "Choose how you want to take part",
  description = "Your account is ready. Pick a journey now, or open your workspace and decide later.",
}: {
  readonly heading?: string;
  readonly description?: string;
}) {
  return (
    <div className="grid gap-6" data-motion-reveal="">
      <div>
        <h2 className="text-fg text-2xl font-bold">{heading}</h2>
        <p className="text-fg-muted mt-2 max-w-md leading-7">{description}</p>
      </div>

      <ul className="motion-pop-group grid gap-3">
        {startableJourneys.map((journey, index) => (
          <li key={journey.id}>
            <Link
              href={journey.href}
              className="group border-hairline/12 hover:border-heritage-gold/60 focus-visible:ring-focus rounded-card motion-lift bg-raised relative flex items-start gap-4 overflow-hidden border p-4 focus-visible:outline-none sm:p-5"
            >
              <span
                aria-hidden="true"
                className="gradient-gold-leaf ease-premium absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
              />
              <span
                aria-hidden="true"
                className="text-numeric text-heritage-gold/70 group-hover:text-heritage-gold w-7 shrink-0 pt-0.5 text-lg font-bold transition-colors"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-fg-muted group-hover:text-fg-accent block text-[0.66rem] font-bold tracking-[0.18em] uppercase transition-colors">
                  {journey.eyebrow}
                </span>
                <span className="text-fg mt-1 block text-lg font-bold">
                  {journey.title}
                </span>
                <span className="text-fg-muted mt-1 block text-sm leading-6">
                  {journey.description}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="text-heritage-gold ease-premium shrink-0 self-center text-xl transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-fg-muted text-sm">
        Not sure yet?{" "}
        <Link
          href="/dashboard"
          className="text-fg focus-visible:ring-focus font-semibold underline underline-offset-4"
        >
          Open your workspace
        </Link>{" "}
        and choose later.
      </p>
    </div>
  );
}
