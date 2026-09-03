import type { RegistrationStatus } from "@tamil-ulagam/shared";
import { Badge } from "@tamil-ulagam/ui";

import { registrationStatusPresentation } from "@/content/enrollment";

export function RegistrationStatusBadge({
  inverse = false,
  status,
}: {
  readonly inverse?: boolean;
  readonly status: RegistrationStatus;
}) {
  const presentation = registrationStatusPresentation[status];
  if (inverse) {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs leading-5 font-semibold tracking-wide text-white backdrop-blur-sm">
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${inverseStatusDot[status]}`}
        />
        {presentation.label}
      </span>
    );
  }
  return (
    <Badge tone={presentation.tone} className="gap-2 py-1.5">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {presentation.label}
    </Badge>
  );
}

const inverseStatusDot: Record<RegistrationStatus, string> = {
  draft: "bg-white/65",
  submitted: "bg-heritage-gold",
  under_review: "bg-heritage-gold",
  needs_changes: "bg-error-inverse",
  verified: "bg-success-inverse",
  rejected: "bg-error-inverse",
  suspended: "bg-error-inverse",
};
