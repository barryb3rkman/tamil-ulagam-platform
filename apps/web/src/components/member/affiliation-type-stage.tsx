"use client";

import { OrganisationMark, SangamMark } from "@/components/join/journey-icons";
import { memberAffiliationTypeContent } from "@/content/member";

export type AffiliationType = "sangam" | "organisation";

const icons: Record<AffiliationType, typeof SangamMark> = {
  sangam: SangamMark,
  organisation: OrganisationMark,
};

export function AffiliationTypeStage({
  onBack,
  onSelect,
}: {
  readonly onSelect: (type: AffiliationType) => void;
  readonly onBack: () => void;
}) {
  return (
    <div className="surface-card grid gap-6 p-5 sm:p-7 lg:p-8">
      <div className="max-w-xl">
        <h2 className="text-global-navy text-xl font-bold tracking-[-0.01em] sm:text-2xl">
          {memberAffiliationTypeContent.title}
        </h2>
        <p className="text-slate mt-2 leading-6">
          {memberAffiliationTypeContent.description}
        </p>
      </div>
      <div
        role="group"
        aria-label={memberAffiliationTypeContent.title}
        className="grid gap-4 sm:grid-cols-2"
      >
        {memberAffiliationTypeContent.options.map((option) => {
          const Icon = icons[option.value as AffiliationType];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value as AffiliationType)}
              className="motion-control border-global-navy/15 hover:border-heritage-maroon focus-visible:ring-focus rounded-card border bg-white p-5 text-left"
            >
              <span
                aria-hidden="true"
                className={
                  option.value === "sangam"
                    ? "bg-teal-depth/12 text-teal-depth grid size-10 place-items-center rounded-full"
                    : "bg-heritage-gold/12 text-heritage-gold grid size-10 place-items-center rounded-full"
                }
              >
                <Icon className="size-5" />
              </span>
              <p className="text-global-navy mt-3 text-base font-bold">
                {option.title}
              </p>
              <p className="text-slate mt-1 text-sm leading-6">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
      <div className="border-global-navy/12 border-t pt-5">
        <button
          type="button"
          onClick={onBack}
          className="text-global-navy focus-visible:ring-focus rounded-button text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none"
        >
          Back
        </button>
      </div>
    </div>
  );
}
