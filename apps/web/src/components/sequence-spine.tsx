import type { ReactNode } from "react";

export interface SpineStep {
  readonly title: string;
  readonly description?: string;
  readonly marker?: string;
  readonly meta?: ReactNode;
}

export function SequenceSpine({
  headingLevel = 3,
  steps,
  tone = "light",
}: {
  readonly headingLevel?: 3 | 4;
  readonly steps: readonly SpineStep[];
  readonly tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const Title = headingLevel === 3 ? "h3" : "h4";

  return (
    <ol data-spine className="relative mt-10 pl-9 sm:pl-12">
      <span
        aria-hidden="true"
        className={`absolute top-2 bottom-2 left-[0.6875rem] w-px sm:left-[1.0625rem] ${
          dark ? "bg-white/14" : "bg-global-navy/12"
        }`}
      />
      <span
        aria-hidden="true"
        className="gradient-gold-leaf absolute top-2 left-[0.6875rem] w-px origin-top sm:left-[1.0625rem]"
        style={{
          height: "calc(100% - 1rem)",
          transform: "scaleY(var(--spine-progress, 1))",
        }}
      />

      {steps.map((step) => (
        <li
          key={step.title}
          data-spine-node
          className="group relative pb-9 last:pb-0"
        >
          <span
            aria-hidden="true"
            className={`ease-snap absolute top-1 -left-9 grid size-6 place-items-center rounded-full border transition-[background-color,border-color,transform,box-shadow] duration-300 group-data-[spine-reached]:scale-110 sm:-left-12 sm:size-8 ${
              dark
                ? "bg-ink group-data-[spine-reached]:border-heritage-gold group-data-[spine-reached]:bg-heritage-gold/20 border-white/25"
                : "border-global-navy/18 group-data-[spine-reached]:border-heritage-gold group-data-[spine-reached]:bg-heritage-gold/15 bg-white"
            } group-data-[spine-reached]:shadow-[0_0_0_0.3rem_rgba(214,168,75,0.14)]`}
          >
            <span
              className={`size-1.5 rounded-full transition-colors duration-300 sm:size-2 ${
                dark ? "bg-white/25" : "bg-global-navy/20"
              } group-data-[spine-reached]:gradient-gold-leaf`}
            />
          </span>

          {step.marker ? (
            <p
              className={`text-[0.68rem] font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                dark
                  ? "group-data-[spine-reached]:text-heritage-gold text-white/40"
                  : "text-slate/70 group-data-[spine-reached]:text-heritage-maroon"
              }`}
            >
              {step.marker}
            </p>
          ) : null}
          <Title
            className={`font-display mt-1.5 text-xl font-semibold tracking-[-0.015em] sm:text-2xl ${
              dark ? "text-white" : "text-global-navy"
            }`}
          >
            {step.title}
          </Title>
          {step.description ? (
            <p
              className={`mt-2.5 max-w-2xl leading-7 ${
                dark ? "text-white/70" : "text-slate"
              }`}
            >
              {step.description}
            </p>
          ) : null}
          {step.meta ? <div className="mt-3">{step.meta}</div> : null}
        </li>
      ))}
    </ol>
  );
}
