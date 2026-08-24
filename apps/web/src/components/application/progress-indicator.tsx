import { registrationSteps } from "@/content/enrollment";

export function ProgressIndicator({
  currentStep,
}: {
  readonly currentStep: number;
}) {
  return (
    <nav aria-label="Registration progress" className="mb-8">
      <ol className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {registrationSteps.map((step, index) => {
          const number = index + 1;
          const isCurrent = number === currentStep;
          const isComplete = number < currentStep;
          return (
            <li
              key={step}
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
                  aria-label={
                    isComplete
                      ? `${step}, completed`
                      : isCurrent
                        ? `${step}, current step`
                        : `${step}, upcoming`
                  }
                >
                  {isComplete ? <span aria-hidden="true">✓</span> : number}
                </span>
                {number < registrationSteps.length ? (
                  <span
                    aria-hidden="true"
                    className={`mx-1.5 h-px min-w-0 flex-1 sm:mx-2 ${isComplete ? "bg-heritage-maroon" : "bg-global-navy/15"}`}
                  />
                ) : null}
              </div>
              <span
                className={`mt-2 hidden text-xs leading-5 font-semibold md:block ${
                  isCurrent
                    ? "text-heritage-maroon"
                    : isComplete
                      ? "text-global-navy"
                      : "text-slate"
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-global-navy mt-3 text-sm font-semibold md:hidden">
        Step {currentStep} of {registrationSteps.length}{" "}
        <span aria-hidden="true">·</span> {registrationSteps[currentStep - 1]}
      </p>
    </nav>
  );
}
