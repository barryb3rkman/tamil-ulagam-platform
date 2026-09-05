import type { CSSProperties } from "react";

interface ProgressFillStyle extends CSSProperties {
  readonly "--tu-progress-from"?: number;
  readonly "--tu-progress-to"?: number;
}

export interface StageProgressProps {
  readonly stages: readonly string[];
  readonly currentStage: number;
  readonly label?: string;
}

export function StageProgress({
  currentStage,
  label = "Progress",
  stages,
}: StageProgressProps) {
  return (
    <nav aria-label={label} className="mb-6">
      <ol
        className="grid gap-1.5 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
        }}
      >
        {stages.map((stage, index) => {
          const number = index + 1;
          const isCurrent = number === currentStage;
          const isComplete = number < currentStage;
          return (
            <li
              key={stage}
              aria-current={isCurrent ? "step" : undefined}
              className="min-w-0"
            >
              <div className="flex items-center">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                    isComplete
                      ? "border-heritage-maroon bg-heritage-maroon text-white"
                      : isCurrent
                        ? "border-heritage-maroon text-heritage-maroon ring-heritage-maroon/10 bg-white ring-4"
                        : "border-global-navy/15 text-slate bg-white"
                  }`}
                >
                  <span aria-hidden="true">{isComplete ? "✓" : number}</span>
                  <span className="sr-only">
                    {isComplete
                      ? `${stage}, completed`
                      : isCurrent
                        ? `${stage}, current step`
                        : `${stage}, upcoming`}
                  </span>
                </span>
                {number < stages.length ? (
                  <span
                    aria-hidden="true"
                    data-motion-progress-fill={isComplete ? "" : undefined}
                    style={
                      {
                        transformOrigin: "left",
                        "--tu-progress-from": 0,
                        "--tu-progress-to": 1,
                      } as ProgressFillStyle
                    }
                    className={`mx-1.5 h-px min-w-0 flex-1 sm:mx-2 ${isComplete ? "bg-heritage-maroon" : "bg-global-navy/15"}`}
                  />
                ) : null}
              </div>
              <span
                className={`text-label mt-2 hidden md:block ${
                  isCurrent
                    ? "text-heritage-maroon"
                    : isComplete
                      ? "text-global-navy"
                      : "text-slate"
                }`}
              >
                {stage}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-global-navy mt-3 text-sm font-semibold md:hidden">
        Stage {currentStage} of {stages.length}{" "}
        <span aria-hidden="true">·</span> {stages[currentStage - 1]}
      </p>
    </nav>
  );
}
