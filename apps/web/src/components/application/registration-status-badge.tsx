import type { RegistrationStatus } from "@tamil-ulagam/shared";
import { Badge } from "@tamil-ulagam/ui";

import { registrationStatusPresentation } from "@/content/enrollment";

export function RegistrationStatusBadge({
  status,
}: {
  readonly status: RegistrationStatus;
}) {
  const presentation = registrationStatusPresentation[status];
  return (
    <Badge tone={presentation.tone} className="gap-2 py-1.5">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {presentation.label}
    </Badge>
  );
}
